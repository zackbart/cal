# Pre-Booking Questionnaire Flow Specification

**Version:** 1.0  
**Phase:** Phase 2 - Pre-Booking Questionnaires & Sensitive Mode  
**Status:** Ready for Implementation

## Overview

The pre-booking questionnaire flow allows users to provide detailed information before selecting a meeting time, ensuring pastors have context before the appointment and enabling better preparation.

## Flow Architecture

### User Journey
1. **User visits** `/book/[username]`
2. **Multi-step questionnaire** appears first (Typeform/Airtable style) [using base questions + a la carte options]
3. **User progresses through steps** with smooth transitions
4. **Questionnaire completion** triggers Cal.com embed
5. **Cal.com embed loads** with pre-filled questionnaire data
6. **User selects time** and completes booking
7. **Webhook triggers** sidecar processing with questionnaire data

### Technical Flow
```
Frontend → Multi-Step Questionnaire → Cal.com Embed → Booking Creation → Webhook → Sidecar Processing
```

## Implementation Details

### Frontend Components

#### 1. Multi-Step Questionnaire Component
```typescript
interface MultiStepQuestionnaireProps {
  username: string;
  onSubmit: (data: QuestionnaireData) => void;
}

interface QuestionnaireStep {
  id: string;
  title: string;
  description?: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: (value: any) => string | null;
}

interface QuestionnaireData {
  reason: string;
  concerns: string;
  communicationPreference: 'email' | 'phone' | 'in-person';
  urgency: 'low' | 'medium' | 'high';
  additionalNotes?: string;
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
  };
}
```

#### 2. Step-by-Step Flow
```typescript
const questionnaireSteps: QuestionnaireStep[] = [
  {
    id: 'reason',
    title: 'What brings you here today?',
    description: 'Help us understand how we can best serve you',
    type: 'textarea',
    required: true,
    placeholder: 'Please share what you\'d like to discuss...'
  },
  {
    id: 'urgency',
    title: 'How urgent is this?',
    type: 'radio',
    required: true,
    options: ['Low - General discussion', 'Medium - Some concern', 'High - Immediate need']
  },
  {
    id: 'communicationPreference',
    title: 'How would you prefer to communicate?',
    type: 'select',
    required: true,
    options: ['In-person meeting', 'Phone call', 'Video call', 'Email']
  },
  {
    id: 'contactInfo',
    title: 'Let\'s get your contact information',
    description: 'We\'ll use this to confirm your appointment',
    type: 'text',
    required: true
  }
];
```

#### 3. Booking Page State Management
```typescript
const [currentStep, setCurrentStep] = useState(0);
const [questionnaireData, setQuestionnaireData] = useState<Partial<QuestionnaireData>>({});
const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
const [accessToken, setAccessToken] = useState<string | null>(null);
```

#### 4. Step Navigation
```typescript
const handleNextStep = () => {
  if (currentStep < questionnaireSteps.length - 1) {
    setCurrentStep(currentStep + 1);
  } else {
    setQuestionnaireCompleted(true);
  }
};

const handlePreviousStep = () => {
  if (currentStep > 0) {
    setCurrentStep(currentStep - 1);
  }
};
```

#### 5. Conditional Rendering
```typescript
// Show multi-step questionnaire first
if (!questionnaireCompleted) {
  return (
    <MultiStepQuestionnaire
      currentStep={currentStep}
      steps={questionnaireSteps}
      data={questionnaireData}
      onDataChange={setQuestionnaireData}
      onNext={handleNextStep}
      onPrevious={handlePreviousStep}
    />
  );
}

// Then show Cal.com embed with pre-filled data
return <CalEmbedWithPrefilledData questionnaireData={questionnaireData} />;
```

### Backend API Endpoints

#### 1. Store Questionnaire Response
```typescript
POST /forms/questionnaire/respond
{
  "username": "zack",
  "responses": {
    "reason": "Pastoral counseling",
    "concerns": "Family issues",
    "communicationPreference": "in-person",
    "urgency": "medium",
    "additionalNotes": "Prefer morning appointments"
  }
}
```

#### 2. Link Questionnaire to Booking
```typescript
// In webhook handler
POST /webhooks/cal/booking.created
{
  "bookingId": "123",
  "questionnaireResponseId": "abc-456"
}
```

### Database Schema

#### Questionnaire Response Entity
```typescript
@Entity('questionnaire_responses')
export class QuestionnaireResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column('jsonb')
  responses: Record<string, any>;

  @Column()
  encrypted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Booking, booking => booking.questionnaireResponse)
  booking: Booking;
}
```

#### Updated Booking Entity
```typescript
@Entity('bookings')
export class Booking {
  // ... existing fields

  @OneToOne(() => QuestionnaireResponse, response => response.booking)
  questionnaireResponse: QuestionnaireResponse;
}
```

## Security & Privacy

### Encryption
- **Sensitive fields** encrypted with AES-GCM
- **Questionnaire responses** stored encrypted by default
- **Audit logging** for all questionnaire access

### Anonymity Support
- **Optional anonymous** questionnaire responses
- **Redaction capabilities** for sensitive information
- **Retention policies** for questionnaire data

## Design System Integration

### ChurchHub Design Tokens
- **Form styling** using ChurchHub color system
- **Typography** following ChurchHub guidelines
- **Spacing and layout** consistent with design system
- **Accessibility** compliance with WCAG standards

### Component Structure
```typescript
// Multi-step questionnaire container
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
  <div className="container mx-auto max-w-2xl px-4 py-8">
    {/* Progress indicator */}
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-600">Step {currentStep + 1} of {questionnaireSteps.length}</span>
        <span className="text-sm text-slate-600">{Math.round(((currentStep + 1) / questionnaireSteps.length) * 100)}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / questionnaireSteps.length) * 100}%` }}
        />
      </div>
    </div>

    {/* Step content */}
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {questionnaireSteps[currentStep].title}
        </h1>
        {questionnaireSteps[currentStep].description && (
          <p className="text-slate-600">{questionnaireSteps[currentStep].description}</p>
        )}
      </div>

      {/* Step form field */}
      <StepFormField 
        step={questionnaireSteps[currentStep]}
        value={questionnaireData[questionnaireSteps[currentStep].id]}
        onChange={(value) => handleDataChange(questionnaireSteps[currentStep].id, value)}
      />

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button 
          onClick={handlePreviousStep}
          disabled={currentStep === 0}
          className="px-6 py-3 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button 
          onClick={handleNextStep}
          disabled={!isStepValid(currentStep)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === questionnaireSteps.length - 1 ? 'Complete' : 'Next →'}
        </button>
      </div>
    </div>
  </div>
</div>
```

## Validation & Error Handling

### Form Validation
- **Required fields** validation
- **Field length** limits
- **Format validation** for specific fields
- **Real-time feedback** during form completion

### Error States
- **Network errors** with retry options
- **Validation errors** with clear messaging
- **Fallback states** for questionnaire failures

## Integration Points

### Cal.com Embed Configuration
```typescript
<Cal
  calLink={username}
  config={{
    name: questionnaireData.name,
    email: questionnaireData.email,
    notes: `Reason: ${questionnaireData.reason}\nConcerns: ${questionnaireData.concerns}\nUrgency: ${questionnaireData.urgency}`,
    // Additional custom fields if supported
  }}
/>
```

### Webhook Processing
```typescript
// In webhook handler
const questionnaireResponse = await this.findQuestionnaireByBookingId(bookingId);
if (questionnaireResponse) {
  await this.processQuestionnaireData(questionnaireResponse);
  await this.generateContextSummary(bookingId, questionnaireResponse);
}
```

## Benefits

### For Pastors
- **Better preparation** with context before meetings
- **Prioritized scheduling** based on urgency
- **Reduced no-shows** with better communication
- **Efficient time management** with pre-screening

### For Users
- **Clear communication** of needs and concerns
- **Flexible scheduling** with preference indication
- **Confidential sharing** of sensitive information
- **Streamlined booking** process

### For System
- **Data-driven insights** from questionnaire responses
- **Automated context summaries** for better preparation
- **Policy enforcement** based on questionnaire data
- **Audit trail** for all interactions

## Implementation Timeline

### Phase 2A: Core Questionnaire
- [ ] Questionnaire form component
- [ ] Database schema updates
- [ ] API endpoints for questionnaire storage
- [ ] Basic validation and error handling

### Phase 2B: Integration
- [ ] Cal.com embed integration with pre-filled data
- [ ] Webhook processing for questionnaire data
- [ ] Secure notes page updates
- [ ] Context summary generation

### Phase 2C: Advanced Features
- [ ] Encryption for sensitive responses
- [ ] Anonymity support
- [ ] Advanced validation rules
- [ ] Analytics and reporting

## Success Metrics

- **Questionnaire completion rate** > 90%
- **Booking conversion rate** maintained or improved
- **Pastor satisfaction** with pre-meeting context
- **User experience** scores for questionnaire flow
- **Data security** compliance with encryption standards

## Conclusion

The pre-booking questionnaire flow provides a comprehensive solution for gathering context before appointments while maintaining the reliability and functionality of the Cal.com booking system. This approach balances user experience, data security, and pastoral care effectiveness.
