// Helper function for formatting chat responses
function formatChatResponse(text?: string): string {
  if (!text) return '';
  return text.trim().replace(/\n{3,}/g, '\n\n');
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ text: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle common questions with immediate responses
    const lowerMessage = message.toLowerCase();
    
    // STARTER QUESTIONS - Always provide guaranteed responses for these questions
    
    // 1. "What can I do as a Patient?"
    if (lowerMessage.includes('what can i do as a patient') || 
        (lowerMessage.includes('what can i do') && lowerMessage.includes('patient'))) {
      const patientCapabilitiesResponse = `<strong>👤 What You Can Do as a Patient in Meditrack</strong><br/><br/>

<strong>🏥 Account & Profile:</strong><br/>
Create and manage your healthcare profile, update medical history, control privacy settings, and view who accessed your records.<br/><br/>

<strong>📅 Appointments:</strong><br/>
Browse doctors by specialization and location, book appointments, reschedule or cancel visits, get reminders, and connect via video consultations.<br/><br/>

<strong>💊 Medications:</strong><br/>
View all prescriptions, set medication reminders, upload proof of intake with photos/videos, track adherence, and receive drug interaction alerts.<br/><br/>

<strong>📋 Health Records:</strong><br/>
Access complete digital health records, share records with doctors, export your data, view lab results, and follow treatment plans.<br/><br/>

<strong>🔒 Privacy & Security:</strong><br/>
Secure OTP verification, manage doctor access permissions, encrypted data protection, and emergency access protocols.<br/><br/>

<em>You have complete control over your healthcare journey! 🎯</em>`;

      return new Response(JSON.stringify({ text: patientCapabilitiesResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. "How to book appointments?"
    if (lowerMessage.includes('how to book appointments') || 
        (lowerMessage.includes('book') && lowerMessage.includes('appointment'))) {
      const appointmentBookingResponse = `<strong>📅 How to Book Appointments</strong><br/><br/>

<strong>Step 1 - Login:</strong> Open Meditrack and complete OTP verification.<br/><br/>

<strong>Step 2 - Find Doctor:</strong> Search by specialization, name, location, or ratings. Filter by fees and available slots.<br/><br/>

<strong>Step 3 - Choose Type:</strong> Select in-person 🏥, video call 💻, or phone consultation 📞. Pick your preferred date and time.<br/><br/>

<strong>Step 4 - Confirm:</strong> Review details, confirm fees, add payment method, and submit request.<br/><br/>

<strong>Step 5 - Get Approved:</strong> Doctor reviews and you receive approval ✅, alternative time 🔄, or cancellation notice ❌.<br/><br/>

<strong>Step 6 - Confirmation:</strong> Receive email/SMS confirmation, calendar invite, reminders, and video link if applicable.<br/><br/>

<em>Quick, easy scheduling at your fingertips! 🎯</em>`;

      return new Response(JSON.stringify({ text: appointmentBookingResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. "How does medicine tracking work?"
    if (lowerMessage.includes('how does medicine tracking work') || 
        lowerMessage.includes('medicine tracking') ||
        (lowerMessage.includes('medicine') && lowerMessage.includes('tracking'))) {
      const medicineTrackingResponse = `<strong>💊 How Medicine Tracking Works</strong><br/><br/>

<strong>Prescription:</strong> Doctor creates digital prescription with dosage, frequency, and instructions.<br/><br/>

<strong>Smart Reminders:</strong> Automatic alerts via push, email, or SMS at prescribed times based on your routine.<br/><br/>

<strong>Take & Verify:</strong> Follow instructions and capture photo 📸 or video 🎥 proof of intake with automatic timestamps.<br/><br/>

<strong>Doctor Review:</strong> Healthcare providers monitor your adherence statistics and uploaded proof to verify compliance.<br/><br/>

<strong>Progress Tracking:</strong> Monitor adherence over time, track health improvements, and adjust treatment based on real data.<br/><br/>

<strong>Smart Features:</strong><br/>
✅ Missed dose alerts with follow-ups<br/>
✅ Drug interaction warnings<br/>
✅ Refill reminders<br/>
✅ Side effect tracking<br/>
✅ Shareable progress reports<br/><br/>

<em>Better outcomes through verified adherence! 📊</em>`;

      return new Response(JSON.stringify({ text: medicineTrackingResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. "Is my medical data secure?"
    if (lowerMessage.includes('is my medical data secure') || 
        lowerMessage.includes('medical data secure') ||
        (lowerMessage.includes('medical') && lowerMessage.includes('secure'))) {
      const dataSecurityResponse = `<strong>🔒 Your Medical Data is Completely Secure</strong><br/><br/>

<strong>🛡️ Military-Grade Protection:</strong><br/>
256-bit AES encryption (bank-level security), end-to-end encryption, encrypted storage, and HTTPS-only communications.<br/><br/>

<strong>🔐 Access Control:</strong><br/>
OTP verification for sensitive operations, patient consent required, role-based permissions, and automatic session logout.<br/><br/>

<strong>📊 Privacy & Compliance:</strong><br/>
HIPAA and GDPR compliant, complete audit trails, no unauthorized sharing, and monitoring of all access attempts.<br/><br/>

<strong>👤 Your Rights:</strong><br/>
✅ Data ownership and control<br/>
✅ Decide who sees your records<br/>
✅ Download your information anytime<br/>
✅ Right to delete data<br/>
✅ Approve or deny access requests<br/><br/>

<strong>🚨 Emergency Protocol:</strong><br/>
Limited emergency access for life-threatening situations with patient contact first, full audit logging, and legal compliance.<br/><br/>

<em>Protected with bank-level security standards! 🏦</em>`;

      return new Response(JSON.stringify({ text: dataSecurityResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // FOLLOW-UP QUESTIONS - Additional comprehensive responses
    
    // 5. "Can doctors see my prescriptions without permission?"
    if (lowerMessage.includes('doctors see my prescriptions') || 
        (lowerMessage.includes('doctor') && lowerMessage.includes('prescription') && lowerMessage.includes('permission'))) {
      const prescriptionPrivacyResponse = `<strong>🔒 Doctor Access to Your Prescriptions</strong><br/><br/>

<strong>Your Privacy Protected:</strong><br/>
❌ No automatic access - doctors cannot see prescriptions by default<br/>
✋ Explicit consent required for any access<br/>
🔐 You control which doctors see which prescriptions<br/>
⏰ Set expiration dates for shared access<br/><br/>

<strong>Permission Process:</strong><br/>
Doctor requests access → You get instant notification → Review and decide → OTP confirmation → Access granted for authorized prescriptions only.<br/><br/>

<strong>Your Control:</strong><br/>
🎯 Share specific prescriptions selectively<br/>
⏰ Set access duration limits<br/>
🔄 Revoke access anytime<br/>
👁️ View complete access logs<br/><br/>

<strong>🚨 Emergency Access:</strong> Limited access for life-threatening cases with contact attempts first and full audit trails.<br/><br/>

<em>Your prescriptions stay private unless you grant permission! 🛡️</em>`;

      return new Response(JSON.stringify({ text: prescriptionPrivacyResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. "How do medication reminders work?"
    if ((lowerMessage.includes('medication') || lowerMessage.includes('medicine')) && 
        lowerMessage.includes('reminder')) {
      const medicationRemindersResponse = `<strong>⏰ Smart Medication Reminders</strong><br/><br/>

<strong>Automatic Setup:</strong><br/>
Doctor prescribes → System creates optimal schedule → Adapts to your routine → Multi-channel alerts (app, SMS, email).<br/><br/>

<strong>Smart Features:</strong><br/>
🕐 Precise timing based on medical requirements<br/>
🍽️ Food instruction reminders ("with food" or "empty stomach")<br/>
💧 Special instructions ("drink plenty of water")<br/>
⚠️ Drug interaction warnings<br/><br/>

<strong>Customization:</strong><br/>
📱 Choose notification methods<br/>
🔊 Custom alert tones per medication<br/>
📅 Flexible scheduling to fit your lifestyle<br/>
🌙 Set quiet hours for do-not-disturb<br/><br/>

<strong>Interactive Options:</strong><br/>
✅ One-tap confirmation<br/>
⏰ Snooze by 5, 10, or 30 minutes<br/>
📸 Optional photo verification<br/>
📝 Record notes and reactions<br/><br/>

<strong>Advanced:</strong> Handle multiple daily doses, track adherence, smart miss-dose recovery, and share progress reports with doctors.<br/><br/>

<em>Never miss a dose with intelligent reminders! 🎯</em>`;

      return new Response(JSON.stringify({ text: medicationRemindersResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 7. "What devices does Meditrack support?"
    if (lowerMessage.includes('device') && lowerMessage.includes('support')) {
      const deviceSupportResponse = `<strong>📱 Device Support</strong><br/><br/>

<strong>Mobile:</strong><br/>
📱 iOS 12+ (iPhone, iPad)<br/>
🤖 Android 7.0+ smartphones and tablets<br/>
⌚ Apple Watch, Samsung Galaxy Watch, Fitbit<br/><br/>

<strong>Desktop:</strong><br/>
🖥️ Windows 10/11<br/>
🍎 macOS (all models)<br/>
🐧 Linux (Ubuntu, CentOS, Fedora)<br/>
🌐 Chromebook<br/><br/>

<strong>Browsers:</strong><br/>
✅ Chrome (recommended), Safari, Firefox, Edge, Opera<br/><br/>

<strong>Features by Platform:</strong><br/>
📸 Camera for medication proof (mobile)<br/>
🔔 Push notifications (all devices)<br/>
📍 Optional location services<br/>
🎤 Voice input for quick notes<br/>
💾 Limited offline mode<br/><br/>

<strong>Accessibility:</strong><br/>
👁️ Screen reader support (NVDA, JAWS, VoiceOver)<br/>
🔤 Adjustable text sizes up to 200%<br/>
🎨 High contrast mode<br/>
⌨️ Full keyboard navigation<br/>
🎵 Audio descriptions<br/><br/>

<strong>Requirements:</strong> 2GB RAM mobile / 4GB desktop, 100MB storage, internet connection, camera for verification.<br/><br/>

<em>Seamless access on any device! 🌟</em>`;

      return new Response(JSON.stringify({ text: deviceSupportResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 8. "How are strategies personalized for me?"
    if (lowerMessage.includes('personalized') || 
        (lowerMessage.includes('strategies') && lowerMessage.includes('personalized'))) {
      const personalizationResponse = `<strong>🎯 AI-Powered Personalization</strong><br/><br/>

<strong>Data-Driven Customization:</strong><br/>
📊 Learns from your medical history<br/>
💊 Monitors treatment responses<br/>
⏰ Adapts to your daily routines<br/>
🎯 Optimizes for your health goals<br/><br/>

<strong>Smart Medication Management:</strong><br/>
🕐 Optimal timing based on your schedule<br/>
🍽️ Integrates with eating habits<br/>
⚠️ Custom allergy warnings<br/>
📱 Your preferred communication methods<br/><br/>

<strong>Lifestyle Adaptation:</strong><br/>
🌅 Matches your sleep schedule<br/>
🏢 Adjusts for work shifts<br/>
👥 Coordinates with caregiver schedules<br/>
🌍 Automatic time zone adjustments for travel<br/><br/>

<strong>AI Intelligence:</strong><br/>
🤖 Continuous machine learning improvement<br/>
📈 Predictive health analytics<br/>
🎯 Personalized risk assessment<br/>
💡 Proactive health recommendations<br/><br/>

<strong>Continuous Evolution:</strong><br/>
Regular effectiveness assessment → Dynamic adjustments → Doctor feedback integration → Outcome-based optimization.<br/><br/>

<em>Healthcare that truly adapts to you! 🌟</em>`;

      return new Response(JSON.stringify({ text: personalizationResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Common platform overview questions
    if (lowerMessage.includes('what') && (lowerMessage.includes('can you do') || lowerMessage.includes('things you can do'))) {
      const overviewResponse = `<strong>🌟 Meditrack Assistant - How I Can Help</strong><br/><br/>

I'm your comprehensive guide to Meditrack's Secure Health Management Platform. I provide detailed information about:<br/><br/>

<strong>👤 Patient Services:</strong><br/>
Account management, appointment booking, medication tracking, prescription management, health records, privacy controls.<br/><br/>

<strong>👨‍⚕️ Doctor Features:</strong><br/>
Patient management, consultation tools, prescription writing, medication compliance verification, schedule management.<br/><br/>

<strong>🏥 Hospital Administration:</strong><br/>
Doctor registration, appointment oversight, fee management, multi-branch coordination, resource management.<br/><br/>

<strong>🔧 System Features:</strong><br/>
Security and privacy, device compatibility, AI personalization, integration capabilities, compliance standards.<br/><br/>

<strong>Ask me about:</strong><br/>
🔐 Data security<br/>
📱 Platform functionality<br/>
🎯 Personalized strategies<br/>
💊 Medicine tracking<br/>
📅 Appointment booking<br/>
🔄 Account setup<br/><br/>

<em>I'm here to help you maximize Meditrack's comprehensive healthcare platform! 💙</em>`;

      return new Response(JSON.stringify({ text: overviewResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Check if API key is available
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ text: 'Api request failed:' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Build request body correctly
    const body = {
      system_instruction: {
        role: "user",
        parts: [
          {
            text: `You are an AI assistant for Meditrack - the Secure Health Management & Personalized Medicine Tracking Platform. 

Follow these instructions strictly:
1. ONLY answer questions related to Meditrack platform.  
2. If the question is unrelated, politely respond with: "Sorry, I can only answer questions about the Secure Health Management & Personalized Medicine Tracking Platform (Meditrack)."  
3. Always base your answers on the platform description and features provided.
4. Keep answers concise (maximum 4-6 sentences). Use HTML markup: <br/> for line breaks, <strong> for emphasis, <em> for italics. DO NOT use markdown formatting like ** or ##. You may include relevant emojis.

### Platform Overview:
Meditrack is a comprehensive healthcare system with role-based access:

**Roles:**
- **Patients** - Personal healthcare management, appointment booking, medication tracking
- **Doctors** - Patient consultation, prescription management, schedule control
- **Hospital Administrators** - Doctor registration, hospital oversight, resource management  
- **System Admins** - Platform security and technical management

**Core Features:**
- Secure appointment booking and management
- Medication tracking with photo/video verification
- Digital health records with privacy controls
- OTP-based security and patient consent systems
- Multi-device support and personalized strategies
- HIPAA/GDPR compliant data protection

Provide detailed, helpful responses about these features and capabilities.`
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ]
    };

    // ✅ Call Gemini API with retry logic
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        const data = await response.json();

        if (response.ok) {
          const reply =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "⚠️ Empty response from Gemini.";

          const formattedReply = formatChatResponse(reply);

          return new Response(JSON.stringify({ text: formattedReply }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (data.error?.message?.includes("overloaded") || data.error?.message?.includes("quota")) {
          lastError = data.error.message;
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        console.error("Gemini API error:", data);
        return new Response(
          JSON.stringify({
            text: "⚠️ Api request failed: " + (data.error?.message || "Unknown error"),
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (fetchError) {
        lastError = fetchError;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    console.error("All retry attempts failed:", lastError);
    return new Response(
      JSON.stringify({
        text: "⚠️ Service temporarily unavailable. The AI model is experiencing high demand. Please try again in a few moments.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Server Error:", err);
    return new Response(
      JSON.stringify({ text: "⚠️ Server error talking to AI" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}