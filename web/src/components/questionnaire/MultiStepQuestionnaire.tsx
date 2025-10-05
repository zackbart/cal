"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface QuestionnaireStep {
  id: string;
  title: string;
  description?: string;
  type: 'text' | 'textarea' | 'select' | 'radio';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: (value: any) => string | null;
}

export interface QuestionnaireData {
  discussionTopic: string;
  meetingPreference: 'in-person' | 'online';
  sensitivity: 'low' | 'medium' | 'high';
  attendees: string;
  location: string;
  customLocation?: string;
  preparation: string;
}

interface MultiStepQuestionnaireProps {
  username: string;
  onComplete: (data: QuestionnaireData) => void;
}

const questionnaireSteps: QuestionnaireStep[] = [
  {
    id: 'discussionTopic',
    title: 'What would you like to discuss?',
    description: 'Help us understand how we can best serve you',
    type: 'textarea',
    required: true,
    placeholder: 'Please share what you\'d like to discuss...'
  },
  {
    id: 'meetingPreference',
    title: 'Do you prefer meeting in person or online?',
    type: 'radio',
    required: true,
    options: ['In-person meeting', 'Online meeting']
  },
  {
    id: 'sensitivity',
    title: 'How sensitive is this meeting?',
    description: 'This helps us prepare appropriately',
    type: 'radio',
    required: true,
    options: ['Low - General discussion', 'Medium - Some concern', 'High - Very sensitive']
  },
  {
    id: 'attendees',
    title: 'Who else will attend?',
    description: 'Let us know if anyone else will be joining',
    type: 'text',
    required: false,
    placeholder: 'e.g., spouse, family member, friend, or just me'
  },
  {
    id: 'location',
    title: 'Where will the meeting take place?',
    description: 'Help us prepare the right environment',
    type: 'select',
    required: true,
    options: ['Church office', 'Coffee shop', 'Your home', 'Online meeting', 'Other (specify below)']
  },
  {
    id: 'preparation',
    title: 'Is there anything I should prepare?',
    description: 'Any specific materials, resources, or information you\'d like me to have ready?',
    type: 'textarea',
    required: false,
    placeholder: 'e.g., specific documents, prayer requests, or background information...'
  }
];

export function MultiStepQuestionnaire({ username, onComplete }: MultiStepQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [questionnaireData, setQuestionnaireData] = useState<Partial<QuestionnaireData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentStepData = questionnaireSteps[currentStep];
  const progress = ((currentStep + 1) / questionnaireSteps.length) * 100;

  const validateStep = (stepId: string, value: any): string | null => {
    const step = questionnaireSteps.find(s => s.id === stepId);
    if (!step) return null;

    if (step.required && (!value || value.toString().trim() === '')) {
      return 'This field is required';
    }

    if (step.validation) {
      return step.validation(value);
    }

    return null;
  };

  const handleDataChange = (stepId: string, value: any) => {
    const error = validateStep(stepId, value);
    
    setQuestionnaireData(prev => ({
      ...prev,
      [stepId]: value
    }));

    setErrors(prev => ({
      ...prev,
      [stepId]: error || ''
    }));
  };

  const isStepValid = (stepIndex: number): boolean => {
    const step = questionnaireSteps[stepIndex];
    const value = questionnaireData[step.id as keyof QuestionnaireData];
    
    // Basic validation
    const isValid = !step.required || (value !== undefined && value !== null && value.toString().trim() !== '');
    
    // Special validation for location step with custom location
    if (step.id === 'location' && value === 'Other (specify below)') {
      const customLocation = questionnaireData.customLocation;
      return isValid && customLocation && customLocation.trim() !== '';
    }
    
    return isValid;
  };

  const handleNextStep = () => {
    if (currentStep < questionnaireSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete questionnaire
      onComplete(questionnaireData as QuestionnaireData);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepField = () => {
    const value = questionnaireData[currentStepData.id as keyof QuestionnaireData];
    const error = errors[currentStepData.id];

    switch (currentStepData.type) {
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleDataChange(currentStepData.id, e.target.value)}
            placeholder={currentStepData.placeholder}
            className={`w-full p-4 border rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-slate-300'
            }`}
          />
        );

      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleDataChange(currentStepData.id, e.target.value)}
            placeholder={currentStepData.placeholder}
            className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-slate-300'
            }`}
          />
        );

      case 'select':
        return (
          <div>
            <select
              value={value || ''}
              onChange={(e) => handleDataChange(currentStepData.id, e.target.value)}
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value="">Select an option...</option>
              {currentStepData.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {/* Show custom location input if "Other (specify below)" is selected */}
            {currentStepData.id === 'location' && value === 'Other (specify below)' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Please specify the location:
                </label>
                <input
                  type="text"
                  value={questionnaireData.customLocation || ''}
                  onChange={(e) => handleDataChange('customLocation', e.target.value)}
                  placeholder="e.g., Starbucks on Main Street, Community Center, etc."
                  className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-slate-300"
                />
              </div>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {currentStepData.options?.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={currentStepData.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleDataChange(currentStepData.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-600">
              Step {currentStep + 1} of {questionnaireSteps.length}
            </span>
            <span className="text-sm text-slate-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {currentStepData.title}
            </h1>
            {currentStepData.description && (
              <p className="text-slate-600">{currentStepData.description}</p>
            )}
          </div>

          {/* Step form field */}
          <div className="mb-6">
            {renderStepField()}
            {errors[currentStepData.id] && (
              <p className="text-red-500 text-sm mt-2">{errors[currentStepData.id]}</p>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button 
              variant="ghost"
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              className="px-6 py-3"
            >
              ← Previous
            </Button>
            <Button 
              onClick={handleNextStep}
              disabled={!isStepValid(currentStep)}
              className="px-6 py-3"
            >
              {currentStep === questionnaireSteps.length - 1 ? 'Complete' : 'Next →'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
