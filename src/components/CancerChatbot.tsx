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
      // The API payload is now simpler, without the 'sentiment' key.
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: newMessagesForApi.map(msg => ({ role: msg.role, content: msg.content })),
          userResponses: userResponses,
        }),
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        console.error('API call failed with status:', response.status);
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

  // --- JSX (No changes needed in the UI structure) ---
  return (
    <div className="bg-white h-[85vh] flex flex-col">
      {/* Header, Tabs, Chat View, Results View, and Input Area JSX remains the same */}
       <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-8 flex-shrink-0">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
               </svg>
           </div>
           <div>
             <h1 className="text-3xl font-bold">Your Health Companion</h1>
             <p className="text-base leading-relaxed text-slate-200 mt-1">Personalized insights to help you stay proactive about your health.</p>
           </div>
         </div>
       </div>
       
       {assessmentComplete && (
         <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
           <button onClick={() => setActiveTab('chat')} className={`px-6 py-4 font-semibold text-sm transition-colors duration-200 ${activeTab === 'chat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
             Chat History
           </button>
           <button onClick={() => setActiveTab('results')} className={`px-6 py-4 font-semibold text-sm transition-colors duration-200 ${activeTab === 'results' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
             Assessment Report
           </button>
         </div>
       )}

       <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50">
         {activeTab === 'chat' && (
             <div className="p-6 space-y-6">
             {messages.map((message, index) => (
               <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-2xl px-6 py-4 ${ message.role === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-br-md shadow-lg' : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-lg border border-gray-100'}`}>
                     <p className="text-base leading-relaxed">{message.content}</p>
                 </div>
               </div>
             ))}
             {isLoading && !assessmentComplete && (
               <div className="flex justify-start"> <div className="bg-white text-gray-800 max-w-2xl px-6 py-4 rounded-2xl rounded-bl-md shadow-lg border border-gray-100"> <div className="flex items-center space-x-2"> <div className="flex space-x-1"> <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div> <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div> <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div> </div> <span className="text-base font-medium">Got it, thinking...</span> </div> </div> </div>
             )}
             <div ref={messagesEndRef} />
           </div>
         )}

                  {activeTab === 'results' && riskAssessment && (
          <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
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

       {!assessmentComplete && (
         <div className="border-t border-gray-100 p-6 bg-white flex-shrink-0">
           <div className="flex items-end gap-4">
             <textarea
               value={currentInput}
               onChange={(e) => setCurrentInput(e.target.value)}
               onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(currentInput); }}}
               placeholder="Type your response here..."
               className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
               rows={1}
               disabled={isLoading}
             />
             <button
               onClick={() => handleSendMessage(currentInput)}
               disabled={isLoading || !currentInput.trim()}
               className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
               Send
             </button>
           </div>
         </div>
       )}
    </div>
  );
}