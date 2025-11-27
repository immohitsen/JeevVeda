'use client';

import { useState, useRef, useEffect } from 'react';
import { UserHealthData, ChatResponse } from '@/lib/types';
import { motion, AnimatePresence } from 'motion/react';

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
  }, [messages, activeTab, scrollToBottom]);

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
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Health Assistant</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-xs sm:text-sm text-gray-600 truncate">AI-powered • Private & Secure</p>
              </div>
            </div>
            {/* Mobile Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-green-700">Online</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Mobile Optimized */}
        {assessmentComplete && (
          <div className="flex border-b border-gray-100 bg-gray-50">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'chat'
                  ? 'border-b-2 border-green-500 text-green-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
              }`}
            >
              <span className="text-base">💬</span>
              <span className="hidden xs:inline">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === 'results'
                  ? 'border-b-2 border-green-500 text-green-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-green-600 hover:bg-white/50'
              }`}
            >
              <span className="text-base">📊</span>
              <span className="hidden xs:inline">Report</span>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content Area - This will scroll */}
      <div className="flex-1 overflow-y-auto">
        {/* Chat Tab Content - Mobile Full Width */}
        {activeTab === 'chat' && (
          <div className="relative bg-white">
            <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 space-y-2" style={{ paddingBottom: !assessmentComplete ? '140px' : '20px' }}>
              <AnimatePresence>
                {messages.map((message, index) => (
                 <motion.div
                   key={index}
                   initial={{ opacity: 0, y: 20, scale: 0.95 }}
                   animate={{ opacity: 1, y: 0, scale: 1 }}
                   exit={{ opacity: 0, y: -20, scale: 0.95 }}
                   transition={{
                     duration: 0.2,
                     ease: "easeOut",
                     delay: index * 0.1
                   }}
                   className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-1 sm:gap-2`}
                 >
                 {message.role === 'assistant' && (
                   <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-sm border-2 border-white">
                     <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                     </svg>
                   </div>
                 )}
                 <div className={`max-w-[85%] sm:max-w-[75%] ${
                   message.role === 'user'
                     ? 'bg-green-500 text-white'
                     : 'bg-gray-50 text-gray-800 border border-gray-200'
                 } rounded-lg shadow-sm`}>
                   <div className="px-3 sm:px-4 py-2 sm:py-2.5">
                     <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                     <div className={`flex items-center justify-end gap-1 mt-1 ${
                       message.role === 'user' ? 'text-green-100' : 'text-gray-400'
                     }`}>
                       <span className="text-xs">
                         {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                       {message.role === 'user' && (
                         <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 24 24">
                           <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                         </svg>
                       )}
                     </div>
                   </div>
                 </div>
                 {message.role === 'user' && (
                   <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-sm border-2 border-white">
                     <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                     </svg>
                   </div>
                 )}
                 </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && !assessmentComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start items-end gap-1"
                >
                 <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mb-1 shadow-sm border-2 border-white">
                   <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                   </svg>
                 </div>
                 <div className="bg-gray-50 text-gray-800 max-w-[70%] rounded-lg shadow-sm border border-gray-200">
                   <div className="px-3 sm:px-4 py-2 sm:py-2.5">
                     <div className="flex items-center space-x-2">
                       <div className="flex space-x-1">
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                       </div>
                       <span className="text-sm text-gray-500">typing...</span>
                     </div>
                   </div>
                 </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Results Tab Content - Mobile Optimized */}
        {activeTab === 'results' && riskAssessment && (
          <div className="bg-gradient-to-br from-slate-50 to-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Your Health Assessment Report</h2>
                <p className="text-sm sm:text-base leading-relaxed text-gray-600">A summary based on our conversation to help you stay proactive.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Risk Overview Card */}
                <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100 sm:col-span-2 lg:col-span-1">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Risk Overview</h3>
                    <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-600 mb-2 sm:mb-3">{riskAssessment.riskScore}/10</div>
                    <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-600">
                      {riskAssessment.riskCategory}
                    </div>
                  </div>
                </div>

                {/* Key Factors Card */}
                <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    Key Factors
                  </h3>
                  <ul className="space-y-3 sm:space-y-4">
                    {riskAssessment.keyRiskFactors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base leading-relaxed text-gray-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Steps Card */}
                <div className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Next Steps
                  </h3>
                  <ul className="space-y-3 sm:space-y-4">
                    {riskAssessment.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 sm:gap-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base leading-relaxed text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Screening Timeline */}
              <div className="mt-6 sm:mt-8 bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Recommended Screening Timeline
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-gray-700">{riskAssessment.screeningTimeline}</p>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl lg:rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-amber-800 mb-2">For Informational Purposes Only</h4>
                    <p className="text-sm sm:text-base leading-relaxed text-amber-700">{riskAssessment.disclaimer}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Input Area */}
      {!assessmentComplete && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg w-full z-30 safe-area-inset-bottom">
          <div className="bg-white border-t border-gray-200">
            <div className="p-3 sm:p-4">
              <div className="w-full">
                {/* Quick Reply Suggestions - Mobile Only */}
                <div className="mb-3 sm:hidden">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {[
                      "Yes", "No", "I don't know", "Sometimes", "Never"
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSendMessage(suggestion)}
                        disabled={isLoading}
                        className="flex-shrink-0 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Container */}
                <div className="flex items-end gap-3">
                  {/* Input Field */}
                  <div className="flex-1 relative bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
                    <textarea
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(currentInput);
                        }
                      }}
                      placeholder="Type your message..."
                      className="w-full border-0 rounded-2xl px-4 py-3 pr-4 focus:outline-none resize-none text-base bg-transparent placeholder-gray-500 min-h-[44px] max-h-32"
                      rows={1}
                      disabled={isLoading}
                      style={{
                        fontSize: '16px' // Prevents zoom on iOS
                      }}
                    />
                  </div>

                  {/* Send/Voice Button */}
                  {currentInput.trim() ? (
                    <button
                      onClick={() => handleSendMessage(currentInput)}
                      disabled={isLoading}
                      className="w-12 h-12 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                        </svg>
                      )}
                    </button>
                  ) : (
                    <button
                      className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                      disabled={isLoading}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Helper Text */}
                <div className="mt-2 px-1">
                  <p className="text-xs text-gray-400 text-center">
                    <span className="inline-block mr-1">🔒</span>
                    Private & secure • AI can make mistakes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}