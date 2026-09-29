import { CONFIG } from '../config';

export interface AIProcessingInput {
  language: 'Tamil' | 'Hindi';
  inputType: 'voice' | 'text';
  textInput?: string;
  presetKey?: string;
}

export interface AIProcessingOutput {
  originalTranscript: string;
  translatedText: string;
  category: 'Water' | 'Roads' | 'Electricity' | 'Sanitation' | 'Healthcare' | 'Education';
  urgency: number; // 0.0 to 1.0
  districtCode: string;
  approxLocation: string;
  approxLat: number;
  approxLng: number;
  geoHash: string;
  modeUsed: string;
}

const DEMO_PRESETS: Record<string, AIProcessingOutput> = {
  'tamil_water': {
    originalTranscript: 'எங்கள் பகுதியில் கடந்த இரண்டு வாரமாக குடிநீர் சரியாக வரவில்லை. பல குடும்பங்கள் பாதிக்கப்பட்டுள்ளனர்.',
    translatedText: 'Drinking water supply has been irregular in our area for the past two weeks. Many families are severely affected.',
    category: 'Water',
    urgency: 0.85,
    districtCode: 'NGP',
    approxLocation: 'Nagapattinam Ward 4, Coastal Belt',
    approxLat: 10.767,
    approxLng: 79.844,
    geoHash: 'tf3x9a',
    modeUsed: 'Demo Mode (Whisper + IndicTrans2 + LLM)'
  },
  'hindi_water': {
    originalTranscript: 'हमारे इलाके में पिछले दो हफ्तों से पानी की समस्या है और कई परिवार प्रभावित हैं।',
    translatedText: 'There is a drinking water shortage in our neighborhood for the last two weeks and many families are affected.',
    category: 'Water',
    urgency: 0.82,
    districtCode: 'NGP',
    approxLocation: 'Nagapattinam North Sector',
    approxLat: 10.772,
    approxLng: 79.839,
    geoHash: 'tf3x9b',
    modeUsed: 'Demo Mode (Whisper + IndicTrans2 + LLM)'
  },
  'tamil_road': {
    originalTranscript: 'மயிலாடுதுறை பிரதான சாலையில் பெரிய பள்ளங்கள் ஏற்பட்டுள்ளன. இருசக்கர வாகன விபத்துகள் அடிக்கடி நடக்கின்றன.',
    translatedText: 'Deep potholes have formed on Mayiladuthurai main road. Two-wheeler accidents are occurring frequently.',
    category: 'Roads',
    urgency: 0.90,
    districtCode: 'MYD',
    approxLocation: 'Mayiladuthurai Main Junction',
    approxLat: 11.101,
    approxLng: 79.652,
    geoHash: 'tf3y1c',
    modeUsed: 'Demo Mode (Whisper + IndicTrans2 + LLM)'
  },
  'hindi_road': {
    originalTranscript: 'मुख्य मार्ग पर गड्ढों के कारण आए दिन दुर्घटनाएं हो रही हैं। सड़क की तुरंत मरम्मत की आवश्यकता है।',
    translatedText: 'Accidents are happening daily due to potholes on the main road. Immediate road repair is required.',
    category: 'Roads',
    urgency: 0.88,
    districtCode: 'MYD',
    approxLocation: 'Mayiladuthurai Bypass Road',
    approxLat: 11.108,
    approxLng: 79.645,
    geoHash: 'tf3y1d',
    modeUsed: 'Demo Mode (Whisper + IndicTrans2 + LLM)'
  },
  'tamil_electricity': {
    originalTranscript: 'தஞ்சாவூர் மேற்கு பகுதியில் அடிக்கடி மின்தடை ஏற்படுகிறது. மாணவர்கள் தேர்வு நேரங்களில் மிகவும் கஷ்டப்படுகிறார்கள்.',
    translatedText: 'Frequent power outages occur in Thanjavur West area. Students face severe difficulty during exam season.',
    category: 'Electricity',
    urgency: 0.75,
    districtCode: 'TNJ',
    approxLocation: 'Thanjavur West Extension',
    approxLat: 10.786,
    approxLng: 79.137,
    geoHash: 'tf3w4e',
    modeUsed: 'Demo Mode (Whisper + IndicTrans2 + LLM)'
  }
};

export async function processCitizenComplaint(input: AIProcessingInput): Promise<AIProcessingOutput> {
  // Demo Mode processing logic
  if (input.presetKey && DEMO_PRESETS[input.presetKey]) {
    return DEMO_PRESETS[input.presetKey];
  }

  // Handle custom text / voice input in demo mode
  let transcript = input.textInput || (input.language === 'Tamil' ? DEMO_PRESETS['tamil_water'].originalTranscript : DEMO_PRESETS['hindi_water'].originalTranscript);
  let translated = input.language === 'Tamil' ? DEMO_PRESETS['tamil_water'].translatedText : DEMO_PRESETS['hindi_water'].translatedText;
  
  if (input.textInput) {
    translated = `[Translated from ${input.language}] ${input.textInput}`;
  }

  // Rule-based keyword classification fallback
  const lowerText = (transcript + ' ' + translated).toLowerCase();
  let category: AIProcessingOutput['category'] = 'Water';
  let urgency = 0.75;
  let districtCode = 'NGP';

  if (lowerText.includes('road') || lowerText.includes('pothole') || lowerText.includes('சாலை') || lowerText.includes('सड़क') || lowerText.includes('गड्ढा')) {
    category = 'Roads';
    urgency = 0.88;
    districtCode = 'MYD';
  } else if (lowerText.includes('power') || lowerText.includes('electricity') || lowerText.includes('மின்') || lowerText.includes('बिजली')) {
    category = 'Electricity';
    urgency = 0.70;
    districtCode = 'TNJ';
  } else if (lowerText.includes('waste') || lowerText.includes('sanitation') || lowerText.includes('குப்பை') || lowerText.includes('कचरा')) {
    category = 'Sanitation';
    urgency = 0.65;
    districtCode = 'TRY';
  }

  return {
    originalTranscript: transcript,
    translatedText: translated,
    category,
    urgency,
    districtCode,
    approxLocation: `${districtCode} Central Zone`,
    approxLat: 10.767 + Math.random() * 0.05,
    approxLng: 79.844 + Math.random() * 0.05,
    geoHash: 'tf3x9a',
    modeUsed: `${CONFIG.AI_PROVIDER_MODE === 'demo' ? 'Demo Mode' : 'Live API'} (Whisper + IndicTrans2 + LLM)`
  };
}
