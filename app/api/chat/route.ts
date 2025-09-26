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
      const patientCapabilitiesResponse = `## 👤 **What You Can Do as a Patient in Meditrack**

**Your Complete Healthcare Management Tools:**

**🏥 Account & Profile Management:**
- ✅ **Create Personal Account** - Register and manage your healthcare profile
- ✅ **Update Medical History** - Add allergies, conditions, and emergency contacts
- ✅ **Manage Privacy Settings** - Control who can access your information
- ✅ **View Access Logs** - See who viewed your medical records and when

**📅 Appointment Management:**
- ✅ **Browse Available Doctors** - Search by specialization, location, ratings
- ✅ **Book Appointments** - Schedule consultations at your convenience  
- ✅ **Reschedule/Cancel** - Modify appointments as needed
- ✅ **Appointment Reminders** - Get notified before your scheduled visits
- ✅ **Video Consultations** - Connect with doctors remotely

**💊 Medication & Prescription Management:**
- ✅ **View Prescriptions** - Access all your current and past medications
- ✅ **Medication Reminders** - Never miss a dose with smart notifications
- ✅ **Upload Intake Proof** - Take photos/videos showing you took your medicine
- ✅ **Track Adherence** - Monitor your medication compliance over time
- ✅ **Drug Interaction Alerts** - Get warnings about medication conflicts

**📋 Health Records & Data:**
- ✅ **Digital Health Records** - Complete medical history in one place
- ✅ **Share Records** - Grant temporary access to new doctors
- ✅ **Export Data** - Download your medical information anytime
- ✅ **Lab Results** - View test results and reports
- ✅ **Treatment Plans** - Access your ongoing care instructions

**🔒 Privacy & Security Controls:**
- ✅ **OTP Verification** - Secure access with one-time passwords
- ✅ **Consent Management** - Approve/deny doctor access requests
- ✅ **Data Encryption** - Your information is always protected
- ✅ **Emergency Access** - Critical info available for emergencies

*As a patient, you have complete control over your healthcare journey with Meditrack's comprehensive tools and security features!*`;

      return new Response(JSON.stringify({ text: patientCapabilitiesResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. "How to book appointments?"
    if (lowerMessage.includes('how to book appointments') || 
        (lowerMessage.includes('book') && lowerMessage.includes('appointment'))) {
      const appointmentBookingResponse = `## 📅 **How to Book Appointments - Step by Step**

**Simple Appointment Booking Process:**

**🔹 Step 1: Login to Your Account**
- Open Meditrack app or website
- Enter your credentials (email/phone + password)
- Complete OTP verification if required

**🔹 Step 2: Find Your Doctor**
- Click "Book Appointment" or "Find Doctors"
- **Search Options:**
  - By Specialization (Cardiology, Pediatrics, etc.)
  - By Doctor Name
  - By Location/Hospital
  - By Available Dates
- **Filter Results:**
  - Doctor ratings and reviews
  - Consultation fees
  - Available time slots

**🔹 Step 3: Select Appointment Details**
- Choose your preferred doctor
- Select appointment type:
  - 🏥 **In-Person Consultation**
  - 💻 **Video Call Consultation**
  - 📞 **Phone Consultation**
- Pick available date and time
- Add reason for visit (optional)

**🔹 Step 4: Confirm Booking**
- Review appointment details
- Confirm consultation fee
- Add payment method if required
- Submit appointment request

**🔹 Step 5: Wait for Doctor Approval**
- Doctor reviews your request
- You receive notification of:
  - ✅ **Approval** - Appointment confirmed
  - 🔄 **Alternative Time** - Doctor suggests different slot
  - ❌ **Cancellation** - With reason provided

**🔹 Step 6: Receive Confirmation**
- Email/SMS confirmation sent
- Calendar invitation added
- Reminder notifications scheduled
- Video call link sent (if applicable)

*Booking appointments is quick, easy, and gives you complete control over your healthcare schedule!*`;

      return new Response(JSON.stringify({ text: appointmentBookingResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. "How does medicine tracking work?"
    if (lowerMessage.includes('how does medicine tracking work') || 
        lowerMessage.includes('medicine tracking') ||
        (lowerMessage.includes('medicine') && lowerMessage.includes('tracking'))) {
      const medicineTrackingResponse = `## 💊 **How Medicine Tracking Works in Meditrack**

**Complete Medication Management System:**

**🔹 Step 1: Doctor Prescribes Medication**
- Doctor creates digital prescription
- Includes medication name, dosage, frequency
- Sets food restrictions and special instructions
- Specifies treatment duration

**🔹 Step 2: Automatic Reminder Setup**
- System creates personalized reminder schedule
- Notifications sent at prescribed times
- Multiple alert methods (push, email, SMS)
- Smart timing based on your daily routine

**🔹 Step 3: Take Your Medicine**
- Follow prescribed dosage and timing
- Take with/without food as instructed
- Use camera to capture proof of intake

**🔹 Step 4: Upload Verification Proof**
- 📸 **Photo Evidence** - Picture of you taking medication
- 🎥 **Video Proof** - Short video showing intake
- ⏰ **Automatic Timestamps** - Date/time recorded
- 📍 **Location Data** - Optional location verification

**🔹 Step 5: Doctor Reviews Compliance**
- Doctors see your adherence statistics
- Review uploaded proof of intake
- Verify you're following treatment plan
- Provide feedback and adjustments

**🔹 Step 6: Progress Tracking**
- Monitor adherence over time
- Track improvement in health outcomes
- Share compliance data with healthcare team
- Adjust treatment based on real data

**📊 Smart Features:**
- ✅ **Missed Dose Alerts** - Follow-up notifications
- ✅ **Drug Interaction Warnings** - Safety alerts
- ✅ **Refill Reminders** - Never run out of medicine
- ✅ **Side Effect Tracking** - Monitor reactions
- ✅ **Progress Reports** - Share with doctors

*Medicine tracking ensures better health outcomes through verified adherence and data-driven treatment adjustments!*`;

      return new Response(JSON.stringify({ text: medicineTrackingResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. "Is my medical data secure?"
    if (lowerMessage.includes('is my medical data secure') || 
        lowerMessage.includes('medical data secure') ||
        (lowerMessage.includes('medical') && lowerMessage.includes('secure'))) {
      const dataSecurityResponse = `## 🔒 **Your Medical Data is Completely Secure in Meditrack**

**Military-Grade Security Protection:**

**🛡️ Advanced Encryption:**
- **256-bit AES Encryption** - Same security as banks
- **End-to-End Encryption** - Data protected during transmission
- **Encrypted Storage** - Information secure even at rest
- **HTTPS Only** - All communications use secure protocols

**🔐 Access Control System:**
- **OTP Verification** - One-time passwords for sensitive operations
- **Patient Consent Required** - You control who accesses your data
- **Role-Based Permissions** - Different access levels for different users
- **Session Management** - Automatic logout for inactive sessions

**📊 Privacy Protection Features:**
- **HIPAA Compliant** - Meets healthcare privacy standards
- **GDPR Compliant** - European data protection compliance
- **Audit Trails** - Complete logs of who accessed your data when
- **No Unauthorized Sharing** - Data never shared without consent

**🔍 What We Monitor:**
- **Login Attempts** - Track all access attempts to your account
- **Data Access Logs** - Record when and who viewed your information
- **Suspicious Activity** - Immediate alerts for unusual behavior
- **System Health** - Continuous monitoring of security systems

**👤 Your Rights & Control:**
- ✅ **Data Ownership** - You own and control your medical information
- ✅ **Access Control** - Decide who can see your records
- ✅ **Data Portability** - Download your information anytime
- ✅ **Right to Delete** - Remove your data if you choose
- ✅ **Consent Management** - Approve/deny access requests

**🚨 Emergency Protocols:**
- **Emergency Override** - Life-threatening situations may allow limited access
- **Patient Contact First** - System tries to reach you before emergency access
- **Legal Compliance** - Follows healthcare emergency regulations
- **Audit Everything** - All emergency access is logged and tracked

**📋 Compliance Standards:**
- 🏥 **HIPAA Compliant** - Healthcare privacy regulations
- 🌍 **GDPR Compliant** - European data protection
- 🔒 **SOC 2 Type II** - Security controls certification
- 📊 **Regular Audits** - Third-party security assessments

*Your medical data security is our top priority - protected with the same level of security as major financial institutions!*`;

      return new Response(JSON.stringify({ text: dataSecurityResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // FOLLOW-UP QUESTIONS - Additional comprehensive responses
    
    // 5. "Can doctors see my prescriptions without permission?"
    if (lowerMessage.includes('doctors see my prescriptions') || 
        (lowerMessage.includes('doctor') && lowerMessage.includes('prescription') && lowerMessage.includes('permission'))) {
      const prescriptionPrivacyResponse = `## 🔒 **Doctor Access to Your Prescriptions - Complete Privacy Control**

**Your Prescription Privacy is Protected:**

**Default Privacy Setting:**
- ❌ **No Automatic Access** - Doctors cannot see your prescriptions by default
- ✋ **Permission Required** - Explicit consent needed for any prescription access
- 🔐 **Your Control** - You decide which doctors see which prescriptions
- ⏰ **Time-Limited Access** - Set expiration dates for prescription sharing

**How Permission System Works:**
1. **Doctor Requests Access** - Healthcare provider submits access request
2. **You Get Notified** - Instant alert about the permission request
3. **Review & Decide** - Choose what to share and for how long
4. **OTP Confirmation** - Secure verification of your decision
5. **Access Granted** - Doctor can now view authorized prescriptions only

**What You Control:**
- 🎯 **Selective Sharing** - Share specific prescriptions with specific doctors
- ⏰ **Access Duration** - Set how long doctors can view your data
- 🔄 **Revoke Anytime** - Cancel doctor access instantly
- 👁️ **View Logs** - See who accessed your prescriptions and when

**Emergency Situations:**
- 🚨 **Life-Threatening Cases** - Limited emergency access for critical care
- 📞 **Contact Protocol** - System attempts to reach you first
- 📋 **Full Audit Trail** - All emergency access is logged and tracked
- ⚖️ **Legal Compliance** - Follows healthcare emergency regulations

*Your prescriptions remain private unless you specifically grant permission to each doctor.*`;

      return new Response(JSON.stringify({ text: prescriptionPrivacyResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. "How do medication reminders work?"
    if ((lowerMessage.includes('medication') || lowerMessage.includes('medicine')) && 
        lowerMessage.includes('reminder')) {
      const medicationRemindersResponse = `## ⏰ **How Smart Medication Reminders Work in Meditrack**

**Intelligent Reminder System:**

**Automatic Setup Process:**
1. **Doctor Prescribes** - Medication details entered by healthcare provider
2. **Smart Scheduling** - System creates optimal reminder times
3. **Personal Customization** - Adapts to your daily routine and preferences
4. **Multi-Channel Alerts** - Notifications via app, SMS, and email

**Smart Reminder Features:**
- 🕐 **Precise Timing** - Exact times based on medical requirements
- 🍽️ **Food Instructions** - "Take with food" or "empty stomach" reminders
- 💧 **Special Instructions** - "Drink plenty of water" alerts
- ⚠️ **Drug Interaction Warnings** - Alerts about medication conflicts

**Customization Options:**
- 📱 **Notification Preferences** - Choose push, SMS, email, or all
- 🔊 **Custom Sounds** - Select unique alert tones for each medication
- 📅 **Flexible Scheduling** - Adjust times to fit your lifestyle
- 🌙 **Quiet Hours** - Set do-not-disturb periods

**Interactive Features:**
- ✅ **Mark as Taken** - Confirm medication intake with one tap
- ⏰ **Snooze Options** - Delay reminders by 5, 10, or 30 minutes
- 📸 **Photo Verification** - Optional proof of intake
- 📝 **Notes & Reactions** - Record how you feel after taking medicine

**Advanced Capabilities:**
- 🔄 **Multiple Daily Doses** - Handle complex medication schedules
- 📊 **Adherence Tracking** - Monitor compliance over time
- 🎯 **Miss-Dose Recovery** - Smart follow-up for skipped medications
- 📈 **Progress Reports** - Share compliance data with doctors

*Never miss a dose with our intelligent reminder system that adapts to your life and ensures optimal medication adherence!*`;

      return new Response(JSON.stringify({ text: medicationRemindersResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 7. "What devices does Meditrack support?"
    if (lowerMessage.includes('device') && lowerMessage.includes('support')) {
      const deviceSupportResponse = `## 📱 **Comprehensive Device Support for Meditrack**

**Universal Device Compatibility:**

**Mobile Devices:**
- 📱 **iOS Devices** - iPhone (iOS 12+), iPad, iPod Touch
- 🤖 **Android Devices** - Android 7.0+ smartphones and tablets
- ⌚ **Wearables** - Apple Watch, Samsung Galaxy Watch, Fitbit integration
- 💻 **Tablets** - Full tablet optimization for larger screens

**Desktop & Laptop:**
- 🖥️ **Windows** - Windows 10, 11 with native app and browser support
- 🍎 **macOS** - MacBook, iMac, Mac Pro with full feature support
- 🐧 **Linux** - Ubuntu, CentOS, Fedora browser compatibility
- 🌐 **Chromebook** - Chrome OS full browser functionality

**Browser Compatibility:**
- ✅ **Chrome** (Recommended) - Optimal performance and full features
- ✅ **Safari** - Native iOS/macOS integration
- ✅ **Firefox** - Complete functionality across all platforms
- ✅ **Edge** - Windows integration and modern features
- ✅ **Opera** - Full support with built-in VPN compatibility

**Special Features by Platform:**
- 📸 **Camera Integration** - Photo/video medication proof (mobile)
- 🔔 **Push Notifications** - Real-time alerts across all devices
- 📍 **Location Services** - Optional location verification
- 🎤 **Voice Input** - Speech-to-text for quick note-taking
- 💾 **Offline Mode** - Limited functionality without internet

**Accessibility Features:**
- 👁️ **Screen Reader Support** - Full NVDA, JAWS, VoiceOver compatibility
- 🔤 **Large Font Options** - Adjustable text sizes up to 200%
- 🎨 **High Contrast Mode** - Enhanced visibility options
- ⌨️ **Keyboard Navigation** - Complete keyboard-only control
- 🎵 **Audio Descriptions** - Voice guidance for visual elements

**Performance Requirements:**
- **RAM:** 2GB minimum mobile, 4GB desktop recommended
- **Storage:** 100MB free space for app installation
- **Internet:** 3G/4G/5G/WiFi connection required
- **Camera:** Required for medication verification features

*Meditrack works seamlessly on any device you use, ensuring your healthcare management is always accessible!*`;

      return new Response(JSON.stringify({ text: deviceSupportResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 8. "How are strategies personalized for me?"
    if (lowerMessage.includes('personalized') || 
        (lowerMessage.includes('strategies') && lowerMessage.includes('personalized'))) {
      const personalizationResponse = `## 🎯 **How Meditrack Personalizes Your Healthcare Experience**

**AI-Powered Personalization Engine:**

**Data-Driven Customization:**
- 📊 **Medical History Analysis** - System learns from your health records
- 💊 **Medication Response Tracking** - Monitors how you respond to treatments
- ⏰ **Lifestyle Pattern Recognition** - Adapts to your daily routines
- 🎯 **Goal-Based Optimization** - Tailors strategies to your health objectives

**Personalized Medication Management:**
- 🕐 **Optimal Timing** - Reminders based on your schedule and meal times
- 🍽️ **Dietary Integration** - Considers your eating habits and food preferences
- ⚠️ **Allergy Considerations** - Custom warnings for your specific allergies
- 📱 **Communication Preferences** - Uses your preferred notification methods

**Lifestyle Adaptation:**
- 🌅 **Circadian Rhythm** - Medication timing matches your sleep schedule
- 🏢 **Work Integration** - Adjusts for shift work or irregular hours
- 👥 **Family Coordination** - Includes caregiver schedules and preferences
- 🌍 **Travel Accommodations** - Automatic time zone adjustments

**Behavioral Learning:**
- 📱 **Usage Patterns** - Learns when you're most likely to take medication
- ✅ **Compliance History** - Adjusts strategies based on adherence patterns
- 🔔 **Response Timing** - Finds optimal times for reminders and alerts
- 💬 **Communication Style** - Adapts message tone and complexity

**AI-Powered Insights:**
- 🤖 **Machine Learning** - Continuously improves based on your data
- 📈 **Predictive Analytics** - Anticipates potential health issues
- 🎯 **Risk Assessment** - Personalized health risk factors
- 💡 **Proactive Recommendations** - Smart suggestions for better outcomes

**Continuous Improvement:**
- 📊 **Regular Assessment** - Evaluates strategy effectiveness
- 🔄 **Dynamic Adjustments** - Modifies approaches based on results
- 👨‍⚕️ **Doctor Feedback** - Incorporates medical professional input
- 📈 **Outcome Tracking** - Measures success of personalized approaches

*Every aspect of Meditrack adapts to you personally, creating a truly customized healthcare experience that evolves with your needs!*`;

      return new Response(JSON.stringify({ text: personalizationResponse }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Common platform overview questions
    if (lowerMessage.includes('what') && (lowerMessage.includes('can you do') || lowerMessage.includes('things you can do'))) {
      const overviewResponse = `## 🌟 **What I Can Help You With - Meditrack Assistant**

**I'm your comprehensive guide to the Secure Health Management & Personalized Medicine Tracking Platform (Meditrack). I can provide detailed information about:**

**👤 Patient Services:**
- ✅ Account creation and profile management
- ✅ Appointment booking and scheduling
- ✅ Medication tracking and reminders
- ✅ Prescription management and verification
- ✅ Health record access and sharing
- ✅ Privacy controls and data security

**👨‍⚕️ Doctor Features:**
- ✅ Patient management and consultation
- ✅ Prescription writing and monitoring
- ✅ Medication compliance verification
- ✅ Schedule management and availability
- ✅ Patient communication and follow-up

**🏥 Hospital Administration:**
- ✅ Doctor registration and approval
- ✅ Hospital-wide appointment oversight
- ✅ Fee management and billing
- ✅ Multi-branch coordination
- ✅ Staff and resource management

**🔧 System Features:**
- ✅ Security and privacy protections
- ✅ Device compatibility and support
- ✅ Personalization and AI features
- ✅ Integration capabilities
- ✅ Compliance and regulations

**Ask me anything about:**
- 🔐 Data security and privacy
- 📱 Platform functionality and features  
- 🎯 Personalized healthcare strategies
- 💊 Medicine tracking and verification
- 📅 Appointment booking and management
- 🔄 Account setup and configuration

*I'm here to help you understand and make the most of Meditrack's comprehensive healthcare management platform!*`;

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