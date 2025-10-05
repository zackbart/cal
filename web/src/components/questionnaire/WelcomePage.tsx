"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WelcomePageProps {
  username: string;
  onStart: () => void;
}

export function WelcomePage({ username, onStart }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
            <span className="text-3xl">🙏</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to ChurchHub Scheduler
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            You're about to schedule a meeting with <span className="font-semibold text-slate-800">{username}</span>. 
            We'll ask you a few questions first to help us prepare for your time together.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* What to Expect */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 text-lg">📋</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">What to Expect</h2>
            </div>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>6 quick questions about your needs</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Choose your preferred meeting style</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Select a time that works for you</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Get confirmation and preparation details</span>
              </li>
            </ul>
          </Card>

          {/* Privacy & Confidentiality */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-lg">🔒</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Privacy & Confidentiality</h2>
            </div>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Your information is kept confidential</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Only {username} will see your responses</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Data is encrypted and secure</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>You can request anonymity if needed</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Time Estimate */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 text-lg">⏱️</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Time Estimate</h2>
          </div>
          <p className="text-center text-slate-600">
            The questionnaire takes about <span className="font-semibold text-slate-800">2-3 minutes</span> to complete, 
            followed by selecting your preferred meeting time.
          </p>
        </Card>

        {/* Start Button */}
        <div className="text-center">
          <Button 
            onClick={onStart}
            size="lg"
            className="px-8 py-4 text-lg font-semibold"
          >
            Start Questionnaire →
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            You can go back and change your answers at any time
          </p>
        </div>
      </div>
    </div>
  );
}
