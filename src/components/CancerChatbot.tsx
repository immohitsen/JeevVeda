'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { UserHealthData, ChatResponse } from '@/lib/types';
import { CancerReportViewer } from './cancer-report-viewer';
import { RiskAssessment } from '@/types/cancer-report';
import { Send, Bot, User, AlertTriangle, CheckCircle, Activity, Info, ChevronRight, BarChart2, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

// --- TYPE DEFINITIONS ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// RiskAssessment interface imported from cancer-report-viewer
// to ensure consistency across components.

// --- Risk Calculation Logic (with previous bug fix) ---
function calculateRisk(responses: Partial<UserHealthData>): RiskAssessment {
  let score = 0;
  const keyFactors: string[] = [];

  const age = responses.age ? parseInt(responses.age) : 0;
  if (!isNaN(age)) {
    if (age > 60) {
      score += 3;
      keyFactors.push(`Age over 60 (${age})`);
    } else if (age > 45) {
      score += 2;
      keyFactors.push(`Age over 45 (${age})`);
    }
  }

  if (responses.family_cancer_history?.toLowerCase().includes('yes')) {
    score += 3;
    keyFactors.push('Positive family history of cancer');
  }

  if (responses.smoking_status?.toLowerCase().includes('current')) {
    score += 3;
    keyFactors.push('Currently smokes');
  } else if (responses.smoking_status?.toLowerCase().includes('former')) {
    score += 1;
    keyFactors.push('Formerly smoked');
  }

  // Corrected symptom checking logic
  const symptomFields: (string | undefined)[] = [
    responses.symptom_digestive_swallowing,
    responses.symptom_bleeding_cough,
    responses.symptom_skin_lumps,
  ];

  const hasReportedSymptoms = symptomFields.some(symptom =>
    symptom && (
      symptom.toLowerCase().includes('yes') ||
      symptom.toLowerCase().includes('fatigue') ||
      symptom.toLowerCase().includes('weight loss')
    )
  );

  if (hasReportedSymptoms) {
    score += 2;
    keyFactors.push('Reported persistent symptoms');
  }

  score = Math.max(1, Math.min(10, score));
  if (keyFactors.length === 0) keyFactors.push('General lifestyle factors');

  let category = 'Low Risk';
  if (score > 3) category = 'Moderate Risk';
  if (score > 6) category = 'High Risk';

  return {
    riskScore: score,
    riskCategory: category,
    keyRiskFactors: keyFactors,
    recommendations: [
      'Discuss these results with your primary care physician.',
      'Maintain a healthy diet and regular exercise routine.',
      'Consider scheduling a routine check-up.',
    ],
    screeningTimeline: 'Based on your risk profile, annual wellness visits are recommended. Your doctor may suggest more specific screenings.',
    interpretation: `A score of ${score} indicates a ${category}. This is not a diagnosis but an indicator to guide conversation with a healthcare professional.`,
    disclaimer: 'This assessment is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.'
  };
}


// --- COMPONENT ---
export default function CancerChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! I'm Dr. Priya, your personal health companion. I'm here to listen and help you understand your health better. Everything you share with me is secure and private. To help me get to know you, could you please start by telling me your age?",
      timestamp: new Date()
    }
  ]);

  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [userResponses, setUserResponses] = useState<Partial<UserHealthData>>({});
  const [aiReportText, setAiReportText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'results'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-focus input when loading finishes
  useEffect(() => {
    if (!isLoading && !assessmentComplete) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isLoading, assessmentComplete]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText, timestamp: new Date() };
    const newMessagesForApi = [...messages, userMessage];
    setMessages(newMessagesForApi);
    setCurrentInput('');
    setIsLoading(true);

    try {
      console.log('Sending request to API with:', {
        history: newMessagesForApi.map(msg => ({ role: msg.role, content: msg.content })),
        userResponses: userResponses,
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: newMessagesForApi.map(msg => ({ role: msg.role, content: msg.content })),
          userResponses: userResponses,
        }),
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API call failed with status:', response.status, 'Error:', errorText);
        throw new Error(`API call failed with status: ${response.status}`);
      }

      let data: ChatResponse;
      try {
        data = await response.json();

        // Debug: Log all API responses
        console.log('API Response:', {
          reply: data.reply,
          extractedData: data.extractedData,
          isComplete: data.isComplete,
          fullResponse: data
        });
      } catch (jsonError) {
        console.error('Failed to parse API response as JSON:', jsonError);
        throw new Error('Invalid JSON response from API');
      }

      // Check if we have a valid reply
      if (!data.reply) {
        console.error('API response missing reply field:', data);
        throw new Error('API response missing required fields');
      }

      // Process extracted data if available
      if (data.extractedData) {
        const { assessment_report, ...healthData } = data.extractedData;

        if (assessment_report) {
          setAiReportText(assessment_report);
        }

        console.log('Extracted Data:', healthData);
        setUserResponses(prevResponses => {
          const newResponses = { ...prevResponses, ...healthData };
          console.log('Updated User Responses:', newResponses);
          return newResponses;
        });
      }

      // Add the assistant's message to the chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // If conversation is complete, perform risk assessment
      if (data.isComplete) {
        const finalResponses = { ...userResponses, ...data.extractedData };
        await performRiskAssessment(finalResponses);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, something went wrong. Let's try again. Could you please respond to my last question?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const performRiskAssessment = async (finalResponses: Partial<UserHealthData>) => {
    console.log('Starting Risk Assessment with data:', finalResponses);

    const thinkingMessage: Message = {
      role: 'assistant',
      content: "Thank you for trusting me with this information. I'm carefully reviewing everything you've shared to prepare your personalized health summary...",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);

    // Simulate analysis time
    setTimeout(() => {
      console.log('Calculating risk with responses:', finalResponses);
      const assessmentResult = calculateRisk(finalResponses);
      console.log('Risk assessment result:', assessmentResult);

      if (assessmentResult) {
        setRiskAssessment(assessmentResult);
        setAssessmentComplete(true);
        const assessmentReadyMessage: Message = {
          role: 'assistant',
          content: `Alright, your health report is ready. I've laid everything out for you. You can hop back to our chat anytime using the tabs.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assessmentReadyMessage]);
        setActiveTab('results');
      } else {
        console.error('Risk assessment failed to produce a result');
        const errorMessage: Message = {
          role: 'assistant',
          content: "Oops, I hit a snag while preparing your report. Could you try refreshing the page to start over?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Sticky Header - Stays at top of content area */}
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100/50 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate">Dr. Priya</h1>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-xs text-gray-500 font-medium">Online • Secure Session</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {!assessmentComplete && (
            <div className="mt-4">
              <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                <span>Assessment Progress</span>
                <span>{Math.min(Object.keys(userResponses).length, 10)} / 10 Questions</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((Object.keys(userResponses).length / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        {assessmentComplete && (
          <div className="flex border-t border-gray-100">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-b-2",
                activeTab === 'chat'
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-b-2",
                activeTab === 'results'
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <BarChart2 className="w-4 h-4" />
              Report
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 scrollbar-thin">
        {/* Chat Tab Content */}
        {activeTab === 'chat' && (
          <div className="px-4 py-6 space-y-6 pb-32">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-emerald-700" />
                  </div>
                )}

                <div className={cn(
                  "max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm sm:text-base leading-relaxed",
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-sm'
                    : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
                )}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className={cn(
                    "text-[10px] mt-2 text-right opacity-70",
                    message.role === 'user' ? 'text-emerald-100' : 'text-gray-400'
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5 text-blue-700" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && !assessmentComplete && (
              <div className="flex gap-4 max-w-3xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Results Tab Content */}
        {activeTab === 'results' && riskAssessment && (
          <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <CancerReportViewer
              data={userResponses}
              reportText={aiReportText}
              riskAssessment={riskAssessment}
            />
          </div>
        )}
      </div>

      {/* Input Area */}
      {!assessmentComplete && (
        <div className="bg-white border-t border-gray-100 p-4 shrink-0 z-30">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Quick Suggestions */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {["Yes", "No", "Not sure", "Sometimes", "Never"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={isLoading}
                  className="flex-shrink-0 px-4 py-2 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 text-sm font-medium rounded-full border border-gray-200 hover:border-emerald-200 transition-all duration-200 whitespace-nowrap"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(currentInput);
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none min-h-[52px] max-h-32 shadow-sm"
                  rows={1}
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={() => handleSendMessage(currentInput)}
                disabled={isLoading || !currentInput.trim()}
                className="h-[52px] w-[52px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}