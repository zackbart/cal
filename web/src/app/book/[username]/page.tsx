"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Cal from "@calcom/embed-react";
import { MultiStepQuestionnaire, QuestionnaireData } from "@/components/questionnaire/MultiStepQuestionnaire";
import { WelcomePage } from "@/components/questionnaire/WelcomePage";

interface BookingPageProps {
  params: {
    username: string;
  };
}

export default function BookingPage({ params }: BookingPageProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [questionnaireStarted, setQuestionnaireStarted] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);

  useEffect(() => {
    async function initializePage() {
      try {
        // Direct access to params in Next.js 14
        setUsername(params.username);
        
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/stack/cal-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stackUserId: params.username }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        setAccessToken(data.accessToken);
      } catch (err) {
        console.error('Error fetching access token:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    initializePage();
  }, [params]);

  const handleStartQuestionnaire = () => {
    setShowWelcome(false);
    setQuestionnaireStarted(true);
  };

  const handleQuestionnaireComplete = async (data: QuestionnaireData) => {
    try {
      // Store questionnaire data
      setQuestionnaireData(data);
      setQuestionnaireCompleted(true);
      
      // TODO: Send questionnaire data to API for storage
      console.log('Questionnaire completed:', data);
    } catch (error) {
      console.error('Error storing questionnaire data:', error);
      setError('Failed to store questionnaire data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 dark:border-slate-600 border-t-slate-900 dark:border-t-white"></div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Loading booking interface</h2>
          <p className="text-slate-600 dark:text-slate-300">Please wait while we prepare your scheduling options...</p>
        </div>
      </div>
    );
  }

  if (error || !accessToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Booking not available</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            {error || 'Unable to load booking interface for this user.'}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors font-medium"
            >
              Try again
            </button>
            <a 
              href="/" 
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Return home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome page first
  if (showWelcome) {
    return <WelcomePage username={username || ''} onStart={handleStartQuestionnaire} />;
  }

  // Show questionnaire if started but not completed
  if (questionnaireStarted && !questionnaireCompleted) {
    return <MultiStepQuestionnaire username={username || ''} onComplete={handleQuestionnaireComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg mb-4">
            <span className="text-2xl">📅</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Schedule with {username}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Choose a time that works for you
          </p>
        </div>

        {/* Main Booking Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Cal.com Booking Interface */}
          <div className="w-full">
            {accessToken && accessToken.startsWith('eyJ') ? (
              <div className="w-full">
                <Cal
                  calLink={`${username}`}
                  config={{
                    name: username || 'User',
                    email: `${username || 'user'}@example.com`,
                    notes: `Reason: ${questionnaireData?.discussionTopic || 'Not specified'}\nSensitivity: ${questionnaireData?.sensitivity || 'Not specified'}\nAttendees: ${questionnaireData?.attendees || 'Just me'}\nLocation: ${questionnaireData?.location === 'Other (specify below)' ? questionnaireData?.customLocation : questionnaireData?.location || 'Not specified'}\nPreparation: ${questionnaireData?.preparation || 'None specified'}`,
                    // Pre-select location based on questionnaire preference
                    ...(questionnaireData?.location && {
                      location: questionnaireData.location === 'Other (specify below)' 
                        ? questionnaireData.customLocation 
                        : questionnaireData.location
                    })
                  }}
                  style={{
                    width: "100%",
                    height: "800px",
                    overflow: "scroll",
                    border: "none",
                    borderRadius: "0"
                  }}
                />
              </div>
            ) : (
              <div className="text-center p-12">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">📅</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                    Booking interface unavailable
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                    Unable to load the booking interface at this time. Please try again later or contact support.
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Powered by <span className="font-medium text-slate-700 dark:text-slate-300">ChurchHub</span>
          </p>
        </div>
      </div>
    </div>
  );
}
