# Multi-Step Questionnaire Implementation - As-Built Documentation

**Date:** 2025-01-05  
**Feature:** Pre-Booking Questionnaire Flow  
**Status:** Completed

## Overview
Implemented a comprehensive multi-step questionnaire system that appears before time selection, providing a Typeform/Airtable-style user experience. The questionnaire collects essential information before users access the Cal.com booking interface.

## Architecture Decision

### Why Pre-Booking Questionnaire?
- **Better User Experience:** Collects information before time selection
- **Data Quality:** Ensures all necessary information is captured
- **Cal.com Integration:** Pre-fills Cal.com notes with questionnaire data
- **Professional Appearance:** Matches modern booking platforms
- **Customization:** Full control over questionnaire design and flow

## Implementation Details

### 1. User Experience Flow ✅

#### Complete Booking Journey
1. **Welcome Page:** Introduction and privacy information
2. **Multi-Step Questionnaire:** 6 base questions with progress indicator
3. **Cal.com Embed:** Time selection with pre-filled questionnaire data
4. **Booking Confirmation:** Automatic via webhooks

#### Welcome Page Features
- **ChurchHub Branding:** Professional introduction
- **Personalized Greeting:** "Welcome to [Pastor Name]'s booking page"
- **What to Expect:** Clear explanation of the process
- **Privacy & Confidentiality:** Assurance of data protection
- **Time Estimate:** "This will take about 2-3 minutes"
- **Start Button:** Clear call-to-action

### 2. Multi-Step Questionnaire ✅

#### Question Structure
Based on the 6 base questions from `overview.md`:

1. **Discussion Topic:** "What would you like to discuss?"
   - Type: Textarea
   - Required: Yes
   - Placeholder: "Please describe what you'd like to talk about..."

2. **Sensitivity Level:** "How sensitive is this topic?"
   - Type: Radio buttons
   - Options: "General", "Somewhat sensitive", "Very sensitive"
   - Required: Yes

3. **Attendees:** "Who will be attending?"
   - Type: Radio buttons
   - Options: "Just me", "Me and my spouse", "My family", "Other"
   - Required: Yes

4. **Meeting Preference:** "How would you prefer to meet?"
   - Type: Radio buttons
   - Options: "In person", "Video call", "Phone call"
   - Required: Yes

5. **Location:** "Where would you like to meet?"
   - Type: Conditional rendering
   - Options: "Church office", "Coffee shop", "Your home", "Online meeting", "Other (specify below)"
   - Custom input for "Other" option
   - Required: Yes

6. **Preparation:** "Is there anything I should prepare for our meeting?"
   - Type: Textarea
   - Required: No
   - Placeholder: "Any specific materials, documents, or information you'd like me to review..."

#### Technical Implementation
```typescript
interface QuestionnaireData {
  discussionTopic: string;
  sensitivity: string;
  attendees: string;
  meetingPreference: string;
  location: string;
  customLocation?: string;
  preparation: string;
}

interface QuestionnaireStep {
  id: string;
  title: string;
  description?: string;
  type: 'textarea' | 'radio' | 'select' | 'text';
  options?: string[];
  required: boolean;
  placeholder?: string;
}
```

### 3. Progress Indicator ✅

#### Visual Progress
- **Step Counter:** "Step 1 of 6"
- **Progress Bar:** Visual progress through questionnaire
- **Step Titles:** Clear indication of current step
- **Navigation:** Previous/Next buttons with validation

#### User Experience
- **Smooth Transitions:** Professional step-by-step flow
- **Validation Feedback:** Clear error messages
- **Progress Persistence:** Maintains progress through steps
- **Responsive Design:** Works on all device sizes

### 4. Cal.com Integration ✅

#### Data Pre-filling
```typescript
// Cal.com configuration with questionnaire data
const config = {
  calLink: `cal.com/${username}`,
  config: {
    theme: 'light',
    branding: false,
    hideEventTypeDetails: false,
    layout: 'month_view',
    notes: `Reason: ${questionnaireData?.discussionTopic || 'Not specified'}
Sensitivity: ${questionnaireData?.sensitivity || 'Not specified'}
Attendees: ${questionnaireData?.attendees || 'Just me'}
Preparation: ${questionnaireData?.preparation || 'None specified'}`,
    // Pre-select location based on questionnaire
    ...(questionnaireData?.location && {
      location: questionnaireData.location === 'Other (specify below)'
        ? questionnaireData.customLocation
        : questionnaireData.location
    })
  }
};
```

#### Location Handling
- **Pre-selection:** Cal.com location pre-selected based on questionnaire
- **Custom Location:** "Other" option allows manual location input
- **Validation:** Ensures custom location is provided when "Other" selected
- **Integration:** Seamless data flow from questionnaire to Cal.com

### 5. Component Architecture ✅

#### MultiStepQuestionnaire Component
```typescript
export function MultiStepQuestionnaire({
  onComplete,
  onCancel
}: MultiStepQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step validation and navigation logic
  // Conditional rendering based on step type
  // Error handling and user feedback
}
```

#### WelcomePage Component
```typescript
export function WelcomePage({
  pastorName,
  onStart
}: WelcomePageProps) {
  // Professional welcome interface
  // Privacy and confidentiality information
  // Clear call-to-action to start questionnaire
}
```

### 6. State Management ✅

#### React State
- **Current Step:** Tracks progress through questionnaire
- **Questionnaire Data:** Stores all user responses
- **Errors:** Validation error messages
- **Loading States:** UI feedback during transitions

#### Data Flow
1. **User Input:** Captured in component state
2. **Validation:** Per-step validation with error handling
3. **Progress:** Step navigation with data persistence
4. **Completion:** Data passed to parent component
5. **Cal.com Integration:** Data formatted for Cal.com notes

## User Experience Features

### Professional Design
- **ChurchHub Branding:** Consistent with design system
- **Modern Interface:** Matches Calendly/Cal.com appearance
- **Smooth Animations:** Professional transitions between steps
- **Responsive Layout:** Works on desktop, tablet, and mobile

### Accessibility
- **Keyboard Navigation:** Full keyboard support
- **Screen Reader Support:** Proper ARIA labels
- **Focus Management:** Clear focus indicators
- **Color Contrast:** Meets accessibility standards

### Error Handling
- **Validation Messages:** Clear, helpful error text
- **Required Field Indicators:** Visual indication of required fields
- **Step Validation:** Cannot proceed without completing required fields
- **Error Recovery:** Easy correction of validation errors

## Technical Implementation

### File Structure
```
/cal/web/src/components/questionnaire/
├── MultiStepQuestionnaire.tsx    # Main questionnaire component
├── WelcomePage.tsx               # Welcome page component
└── (future components)
```

### Integration Points
```typescript
// book/[username]/page.tsx
export default function BookingPage({ params }: BookingPageProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [questionnaireStarted, setQuestionnaireStarted] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);

  // Conditional rendering based on questionnaire state
  if (showWelcome) return <WelcomePage onStart={handleStartQuestionnaire} />;
  if (questionnaireStarted && !questionnaireCompleted) {
    return <MultiStepQuestionnaire onComplete={handleQuestionnaireComplete} />;
  }
  // Cal.com embed with questionnaire data
}
```

### Data Validation
```typescript
const validateStep = (step: number, data: QuestionnaireData): boolean => {
  switch (step) {
    case 0: return data.discussionTopic?.trim().length > 0;
    case 1: return data.sensitivity?.length > 0;
    case 2: return data.attendees?.length > 0;
    case 3: return data.meetingPreference?.length > 0;
    case 4: return data.location?.length > 0 && 
               (data.location !== 'Other (specify below)' || data.customLocation?.trim().length > 0);
    case 5: return true; // Preparation is optional
    default: return false;
  }
};
```

## Cal.com Integration Details

### Notes Formatting
```typescript
const formatNotes = (data: QuestionnaireData): string => {
  return `Reason: ${data.discussionTopic || 'Not specified'}
Sensitivity: ${data.sensitivity || 'Not specified'}
Attendees: ${data.attendees || 'Just me'}
Preparation: ${data.preparation || 'None specified'}`;
};
```

### Location Pre-selection
```typescript
const getLocationConfig = (data: QuestionnaireData) => {
  if (!data.location) return {};
  
  if (data.location === 'Other (specify below)') {
    return { location: data.customLocation };
  }
  
  return { location: data.location };
};
```

### Embed Configuration
```typescript
const config = {
  calLink: `cal.com/${username}`,
  config: {
    theme: 'light',
    branding: false,
    hideEventTypeDetails: false,
    layout: 'month_view',
    notes: formatNotes(questionnaireData),
    ...getLocationConfig(questionnaireData)
  }
};
```

## Future Enhancements

### Planned Features
1. **Conditional Logic:** Show/hide questions based on previous answers
2. **Custom Questions:** Admin interface for questionnaire customization
3. **Question Types:** File uploads, date pickers, multi-select
4. **Analytics:** Track questionnaire completion rates
5. **A/B Testing:** Test different questionnaire flows

### Advanced Features
1. **Dynamic Questions:** Questions that change based on pastor preferences
2. **Multi-language Support:** Questionnaire in multiple languages
3. **Accessibility Enhancements:** Voice input, screen reader optimization
4. **Mobile Optimization:** Touch-friendly interface improvements
5. **Offline Support:** Continue questionnaire without internet

## Testing

### User Experience Testing
1. **Flow Testing:** Complete questionnaire flow from start to finish
2. **Validation Testing:** Error handling and validation messages
3. **Mobile Testing:** Responsive design on various devices
4. **Accessibility Testing:** Screen reader and keyboard navigation
5. **Performance Testing:** Smooth transitions and loading states

### Integration Testing
1. **Cal.com Integration:** Data properly passed to Cal.com embed
2. **Location Handling:** Custom location input and validation
3. **Notes Formatting:** Proper formatting of questionnaire data
4. **Webhook Processing:** Questionnaire data in booking webhooks

## Performance

### Optimization Features
- **Lazy Loading:** Components loaded as needed
- **State Management:** Efficient React state updates
- **Validation:** Client-side validation for immediate feedback
- **Smooth Transitions:** CSS transitions for professional feel

### Metrics
- **Completion Rate:** Track questionnaire completion percentage
- **Time to Complete:** Average time spent on questionnaire
- **Drop-off Points:** Identify where users abandon the flow
- **Error Rates:** Track validation error frequency

## Notes
- Questionnaire provides excellent user experience
- Cal.com integration is seamless and functional
- System is ready for production use
- Future enhancements planned for advanced features
- Documentation is comprehensive and up-to-date
