'use client';

import { useState, useRef, useEffect } from 'react';
import { UserHealthData, ChatResponse } from '@/lib/types';

// --- TYPE DEFINITIONS ---
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RiskAssessment {
  riskScore: number;
  riskCategory: string;
  keyRiskFactors: string[];
  recommendations: string[];
  screeningTimeline: string;
  interpretation: string;
  disclaimer: string;
}

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
    responses.symptom_bowel_bladder, responses.symptom_sore,
    responses.symptom_bleeding, responses.symptom_lump,
    responses.symptom_swallowing, responses.symptom_mole_change,
    responses.symptom_cough,
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
      content: "Hey there! I'm here to help you with a quick health assessment. I'll ask you some simple questions about your health - it's completely private and will only take a few minutes. Let's start with your age - how old are you?",
      timestamp: new Date()
    }
  ]);
  
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [userResponses, setUserResponses] = useState<Partial<UserHealthData>>({});
  const [activeTab, setActiveTab] = useState<'chat' | 'results'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

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
        console.log('Extracted Data:', data.extractedData);
        setUserResponses(prevResponses => {
          const newResponses = { ...prevResponses, ...data.extractedData };
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
      content: "Awesome, that's everything I need. Thanks for sharing all that with me. I'm just putting together your summary now...",
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
      <div className="sticky top-0 bg-white border-b border-gray-100 z-20">
        {/* Chatbot Header */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Health Assistant</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm text-gray-600">AI-powered health screening • Private & Secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - only show when assessment is complete */}
        {assessmentComplete && (
          <div className="flex border-b border-gray-100 bg-gray-50">
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'chat' 
                  ? 'border-b-2 border-green-500 text-green-600 bg-white' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-white'
              }`}
            >
              💬 Chat
            </button>
            <button 
              onClick={() => setActiveTab('results')} 
              className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'results' 
                  ? 'border-b-2 border-green-500 text-green-600 bg-white' 
                  : 'text-gray-600 hover:text-green-600 hover:bg-white'
              }`}
            >
              📊 Report
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content Area - This will scroll */}
      <div className="flex-1 overflow-y-auto">
        {/* Chat Tab Content */}
        {activeTab === 'chat' && (
          <div className="bg-gray-50 relative">
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
               <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                 {message.role === 'assistant' && (
                   <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                     <span className="text-xs font-bold text-white">AI</span>
                   </div>
                 )}
                 <div className={`max-w-lg px-3 py-2 ${ 
                   message.role === 'user' 
                     ? 'bg-green-500 text-white rounded-2xl rounded-br-md shadow-sm' 
                     : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-200'
                 }`}>
                     <p className="text-sm leading-relaxed">{message.content}</p>
                     <div className="mt-1">
                       <span className="text-xs opacity-60">
                         {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                     </div>
                 </div>
                 {message.role === 'user' && (
                   <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                     <span className="text-xs font-bold text-gray-600">You</span>
                   </div>
                 )}
               </div>
             ))}
             {isLoading && !assessmentComplete && (
               <div className="flex justify-start items-end gap-2">
                 <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                   <span className="text-xs font-bold text-white">AI</span>
                 </div>
                 <div className="bg-white text-gray-800 max-w-sm px-3 py-2 rounded-2xl rounded-bl-md shadow-sm border border-gray-200">
                   <div className="flex items-center space-x-2">
                     <div className="flex space-x-1">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                     </div>
                     <span className="text-sm text-gray-600">Thinking...</span>
                   </div>
                 </div>
               </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Results Tab Content */}
        {activeTab === 'results' && riskAssessment && (
          <div className="bg-gradient-to-br from-slate-50 to-white p-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Health Assessment Report</h2>
                <p className="text-base leading-relaxed text-gray-600">A summary based on our conversation to help you stay proactive.</p>
              </div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Risk Overview</h3>
                    <div className="text-5xl font-bold text-blue-600 mb-3">{riskAssessment.riskScore}/10</div>
                    <div className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                      {riskAssessment.riskCategory}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    Key Factors
                  </h3>
                  <ul className="space-y-4">
                    {riskAssessment.keyRiskFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-base leading-relaxed text-gray-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Next Steps
                  </h3>
                  <ul className="space-y-4">
                    {riskAssessment.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-base leading-relaxed text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Recommended Screening Timeline
                </h3>
                <p className="text-base leading-relaxed text-gray-700">{riskAssessment.screeningTimeline}</p>
              </div>
              <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-amber-800 mb-2">For Informational Purposes Only</h4>
                    <p className="text-base leading-relaxed text-amber-700">{riskAssessment.disclaimer}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Input Area - At bottom when assessment not complete */}
      {!assessmentComplete && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 p-4 bg-white shadow-lg w-full z-30">
           <div className="max-w-4xl mx-auto">
             <div className="flex items-center gap-3">
               <div className="flex-1 relative">
                 <textarea
                   value={currentInput}
                   onChange={(e) => setCurrentInput(e.target.value)}
                   onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(currentInput); }}}
                   placeholder="Message Health Assistant..."
                   className="w-full border border-gray-300 rounded-3xl px-4 py-3 pr-12 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none text-sm bg-gray-50 focus:bg-white transition-colors"
                   rows={1}
                   disabled={isLoading}
                 />
                 <button
                   onClick={() => handleSendMessage(currentInput)}
                   disabled={isLoading || !currentInput.trim()}
                   className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full hover:from-green-500 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                   </svg>
                 </button>
               </div>
             </div>
             <div className="mt-2 px-1">
               <p className="text-xs text-gray-400 text-center">💬 AI can make mistakes. Your data is private and secure.</p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}