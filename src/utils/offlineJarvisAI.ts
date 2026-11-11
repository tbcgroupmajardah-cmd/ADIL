/**
 * Stark Industries Offline Neural Engine & Phone Controller
 * 100% Local Natural Language Processing & Voice Command Dispatcher
 * Hands-Free Phone Control & Iron Man HUD Automation.
 * Supports dynamic Assistant Name (e.g., "Sahal", "Jarvis") and Commander Name (e.g., "Adil").
 * Supports English and Bangla (বাংলা + Banglish).
 */

export interface JarvisAIResponse {
  reply: string;
  action?: 
    | 'fire_repulsor'
    | 'toggle_stealth'
    | 'house_party'
    | 'veronica'
    | 'clean_slate'
    | 'overdrive'
    | 'standard_mode'
    | 'open_apk'
    | 'charge_unibeam'
    | 'reroute_power'
    | 'toggle_mute'
    | 'toggle_torch'
    | 'check_battery'
    | 'vibrate_phone'
    | 'open_dialer'
    | 'open_camera'
    | 'toggle_hands_free'
    | 'keep_screen_on'
    | 'change_assistant_name'
    | 'open_biometric_scanner';
  actionLabel?: string;
  actionParam?: any;
}

export function processOfflineJarvisQuery(
  rawInput: string, 
  language: 'en' | 'bn' = 'bn',
  context?: { 
    batteryLevel?: number; 
    isCharging?: boolean; 
    torchOn?: boolean;
    assistantName?: string;
    commanderName?: string;
  }
): JarvisAIResponse {
  const assistantName = context?.assistantName || 'Sahal';
  const commanderName = context?.commanderName || 'Adil';
  const input = rawInput.toLowerCase().trim();

  // Helper check
  const matches = (...keywords: string[]) => keywords.some(k => input.includes(k.toLowerCase()));

  // ==========================================
  // DYNAMIC NAME CHANGE COMMANDS
  // ==========================================
  if (
    matches(
      'change name to', 'rename to', 'call you', 'set name to',
      'নাম পরিবর্তন', 'নাম রাখো', 'তোমাকে ডাকব', 'নাম বদলে দাও'
    )
  ) {
    // Extract new name if mentioned
    let newName = '';
    const nameMatch = input.match(/(?:change name to|rename to|call you|set name to|নাম পরিবর্তন করে|নাম রাখো|তোমাকে ডাকব)\s+([a-zA-Z\u0980-\u09FF]+)/i);
    if (nameMatch && nameMatch[1]) {
      newName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    } else {
      newName = assistantName.toLowerCase() === 'sahal' ? 'Jarvis' : 'Sahal';
    }

    if (language === 'bn') {
      return {
        reply: `আমার নাম পরিবর্তন করে "${newName}" নির্ধারণ করা হয়েছে, কমান্ডার ${commanderName}। এখন থেকে আপনি আমাকে এই নামেই ডাকতে পারেন।`,
        action: 'change_assistant_name',
        actionLabel: 'NAME_CHANGED',
        actionParam: newName,
      };
    }
    return {
      reply: `Assistant call name updated to "${newName}", Commander ${commanderName}. You may summon me using this identifier anytime.`,
      action: 'change_assistant_name',
      actionLabel: 'NAME_CHANGED',
      actionParam: newName,
    };
  }

  // Biometric / Fingerprint / Retinal Scanner
  if (
    matches(
      'biometric', 'fingerprint', 'retinal', 'retina scan', 'scan finger', 'scanner',
      'বায়োমেট্রিক', 'ফিঙ্গারপ্রিন্ট', 'রেটিনা', 'আঙুলের ছাপ', 'রেটিনা স্ক্যান'
    )
  ) {
    if (language === 'bn') {
      return {
        reply: `বায়োমেট্রিক স্ক্যানার চালু করা হচ্ছে, কমান্ডার ${commanderName}। দয়া করে আপনার ফিঙ্গারপ্রিন্ট বা রেটিনা স্ক্যান করুন।`,
        action: 'open_biometric_scanner',
        actionLabel: 'BIOMETRIC_OPENED',
      };
    }
    return {
      reply: `Biometric authentication terminal engaged, Commander ${commanderName}. Please verify fingerprint or retinal scan.`,
      action: 'open_biometric_scanner',
      actionLabel: 'BIOMETRIC_OPENED',
    };
  }

  // ==========================================
  // HANDS-FREE PHONE HARDWARE CONTROLS
  // ==========================================

  // 1. Flashlight / Torch
  if (
    matches(
      'flashlight', 'torch', 'light on', 'light off', 'turn on light', 'turn off light',
      'ফ্ল্যাশলাইট', 'আলো জ্বালাও', 'আলো বন্ধ', 'টর্চ', 'টর্চ অন', 'টর্চ অফ',
      'alo jalao', 'alo bondho', 'torch on', 'torch bondho', 'flashlight on'
    )
  ) {
    const isOffCommand = matches('off', 'বন্ধ', 'bondho', 'disable', 'নিভিয়ে');
    if (language === 'bn' || matches('ফ্ল্যাশলাইট', 'আলো', 'টর্চ', 'alo', 'torch')) {
      return {
        reply: isOffCommand 
          ? `ফোনের ফ্ল্যাশলাইট বন্ধ করা হয়েছে, কমান্ডার ${commanderName}।` 
          : `ফোনের ফ্ল্যাশলাইট প্রজ্বলিত করা হয়েছে, কমান্ডার ${commanderName}। চারপাশ আলোকিত।`,
        action: 'toggle_torch',
        actionLabel: isOffCommand ? "TORCH_OFF" : "TORCH_ON",
        actionParam: !isOffCommand
      };
    }
    return {
      reply: isOffCommand
        ? `Flashlight deactivated, Commander ${commanderName}.`
        : `Flashlight engaged, Commander ${commanderName}. Illuminating immediate surroundings.`,
      action: 'toggle_torch',
      actionLabel: isOffCommand ? "TORCH_OFF" : "TORCH_ON",
      actionParam: !isOffCommand
    };
  }

  // 2. Battery Telemetry
  if (
    matches(
      'battery', 'charge', 'phone power', 'battery status',
      'ব্যাটারি', 'চার্জ', 'ফোনের চার্জ', 'ব্যাটারি কত', 'চার্জ কত',
      'battery koto', 'charge koto', 'battery level'
    )
  ) {
    const level = context?.batteryLevel ?? 88;
    const isCharging = context?.isCharging ?? false;

    if (language === 'bn' || matches('ব্যাটারি', 'চার্জ', 'battery', 'charge')) {
      return {
        reply: `আপনার ফোনের ব্যাটারি স্তর ${level}%${isCharging ? ' এবং এটি বর্তমানে চার্জ হচ্ছে' : ''}, কমান্ডার ${commanderName}। মোবাইল পাওয়ার ব্যাকআপ স্থিতিশীল।`,
        action: 'check_battery',
        actionLabel: "BATTERY_CHECKED"
      };
    }
    return {
      reply: `Phone battery is holding at ${level}% capacity${isCharging ? ', actively charging' : ''}, Commander ${commanderName}. Mobile subroutines operating smoothly.`,
      action: 'check_battery',
      actionLabel: "BATTERY_CHECKED"
    };
  }

  // 3. Vibrate Phone
  if (
    matches(
      'vibrate', 'haptic', 'buzz',
      'ভাইব্রেট', 'ভাইব্রেশন', 'কম্পন',
      'vibrate koro', 'vibration'
    )
  ) {
    if (language === 'bn' || matches('ভাইব্রেট', 'ভাইব্রেশন')) {
      return {
        reply: `ফোনের হ্যাপটিক ভাইব্রেশন নির্গত হয়েছে, কমান্ডার ${commanderName}।`,
        action: 'vibrate_phone',
        actionLabel: "PHONE_VIBRATED"
      };
    }
    return {
      reply: `Tactical haptic vibration pulse emitted, Commander ${commanderName}.`,
      action: 'vibrate_phone',
      actionLabel: "PHONE_VIBRATED"
    };
  }

  // 4. Hands-Free Keep Screen On / Wake Lock
  if (
    matches(
      'keep screen on', 'screen awake', 'screen on', 'wake lock',
      'স্ক্রিন অন রাখো', 'স্ক্রিন বন্ধ করবে না', 'ডিসপ্লে অন',
      'screen on rakho', 'screen bondho koro na'
    )
  ) {
    if (language === 'bn' || matches('স্ক্রিন', 'ডিসপ্লে')) {
      return {
        reply: `হ্যান্ডস-ফ্রি স্ক্রিন ওয়েক-লক সক্রিয় করা হয়েছে, কমান্ডার ${commanderName}। স্ক্রিন সর্বদা জ্বলবে।`,
        action: 'keep_screen_on',
        actionLabel: "WAKE_LOCK_ENGAGED"
      };
    }
    return {
      reply: `Hands-free Screen Wake-Lock engaged, Commander ${commanderName}. Display will remain active indefinitely for HUD telemetry.`,
      action: 'keep_screen_on',
      actionLabel: "WAKE_LOCK_ENGAGED"
    };
  }

  // 5. Phone Call / Emergency Dialer
  if (
    matches(
      'make a call', 'open dialer', 'call emergency', 'phone call',
      'ফোন কর', 'কল কর', 'কল দাও', 'ডায়ালার খোলো',
      'phone koro', 'call dao', 'dialer kholo'
    )
  ) {
    if (language === 'bn' || matches('কল', 'ডায়াল')) {
      return {
        reply: `ডায়ালার খোলা হচ্ছে, কমান্ডার ${commanderName}।`,
        action: 'open_dialer',
        actionLabel: "DIALER_OPENED"
      };
    }
    return {
      reply: `Opening phone dialer, Commander ${commanderName}.`,
      action: 'open_dialer',
      actionLabel: "DIALER_OPENED"
    };
  }

  // 6. Camera / Scanner
  if (
    matches(
      'camera', 'scan environment', 'optical scan', 'open camera',
      'ক্যামেরা খোলো', 'ক্যামেরা স্ক্যান', 'চারপাশ স্ক্যান',
      'camera kholo', 'scan koro'
    )
  ) {
    if (language === 'bn' || matches('ক্যামেরা', 'camera')) {
      return {
        reply: `অপটিক্যাল ক্যামেরা এবং টার্গেটিং স্ক্যানার খোলা হয়েছে, কমান্ডার ${commanderName}।`,
        action: 'open_camera',
        actionLabel: "CAMERA_SCAN_OPENED"
      };
    }
    return {
      reply: `Optical camera sensor and tactical HUD overlay engaged, Commander ${commanderName}.`,
      action: 'open_camera',
      actionLabel: "CAMERA_SCAN_OPENED"
    };
  }

  // ==========================================
  // WEAPONS & TACTICAL SUIT COMMANDS
  // ==========================================

  // Repulsor Discharge
  if (
    matches(
      'fire repulsor', 'repulsor', 'shoot', 'fire weapon', 'engage weapon', 'blast',
      'রিপালসর', 'গুলি কর', 'ফায়ার কর', 'আক্রমণ কর', 'হাতিয়ার চালাও',
      'repulsor fire koro', 'guli koro', 'fire koro'
    )
  ) {
    if (language === 'bn' || matches('রিপালসর', 'গুলি', 'fire koro', 'guli')) {
      return {
        reply: `রিপালসর এমিটার সিঙ্ক্রোনাইজড এবং ফায়ার করা হয়েছে, কমান্ডার ${commanderName}। লক্ষ্যবস্তু ধূলিসাৎ।`,
        action: 'fire_repulsor',
        actionLabel: "REPULSOR_DISCHARGE"
      };
    }
    return {
      reply: `Repulsor emitters synchronized and discharged, Commander ${commanderName}. Target perimeter cleared.`,
      action: 'fire_repulsor',
      actionLabel: "REPULSOR_DISCHARGE"
    };
  }

  // Unibeam
  if (
    matches(
      'unibeam', 'chest beam', 'maximum power',
      'ইউনিবিম', 'বুকের লেজার', 'বুকের বিম',
      'unibeam charge koro'
    )
  ) {
    if (language === 'bn' || matches('ইউনিবিম', 'unibeam')) {
      return {
        reply: `বুকের আর্ক রিঅ্যাক্টর থেকে ইউনিবিম সম্পূর্ণ চার্জ করা হয়েছে। আপনার ফায়ার আদেশের অপেক্ষায় আছি, কমান্ডার ${commanderName}।`,
        action: 'charge_unibeam',
        actionLabel: "UNIBEAM_PRIMED"
      };
    }
    return {
      reply: `Unibeam capacitors locked and drawing direct from the synthesized Arc core. Standing by for firing command, Commander ${commanderName}.`,
      action: 'charge_unibeam',
      actionLabel: "UNIBEAM_PRIMED"
    };
  }

  // Status & Diagnostics
  if (
    matches(
      'status', 'diagnostic', 'system', 'how are we doing', 'suit check',
      'অবস্থা', 'স্ট্যাটাস', 'ডায়াগনস্টিক', 'সিস্টেম চেক', 'কেমন চলছে',
      'status ki', 'obostha ki', 'suit er obostha'
    )
  ) {
    if (language === 'bn' || matches('অবস্থা', 'স্ট্যাটাস', 'obostha', 'ki')) {
      return {
        reply: `কমান্ডার ${commanderName}, মার্ক ৮৫-এর সমস্ত সিস্টেম ১০০% সচল। আর্ক রিঅ্যাক্টরের তাপমাত্রা ৪১২ কেলভিন, ন্যানোটেক কভার ৯৯.৪% এবং রিপালসর সম্পূর্ণ চার্জড।`,
        actionLabel: "DIAGNOSTICS_VERIFIED"
      };
    }
    return {
      reply: `Commander ${commanderName}, all Mark LXXXV systems are running at peak efficiency. Arc Reactor core temperature is holding at 412 Kelvin, nanotech integrity at 99.4%, and repulsor capacitors are fully primed.`,
      actionLabel: "DIAGNOSTICS_VERIFIED"
    };
  }

  // Protocols: House Party
  if (
    matches(
      'house party', 'deploy armors', 'iron legion',
      'হাউস পার্টি', 'সমস্ত আর্মার পাঠাও', 'সব স্যুট ডাকো',
      'house party protocol', 'shob suit dako'
    )
  ) {
    if (language === 'bn' || matches('হাউস পার্টি', 'স্যুট', 'house party')) {
      return {
        reply: `হাউস পার্টি প্রোটোকল সক্রিয় করা হয়েছে, কমান্ডার ${commanderName}। সিলভার সেঞ্চুরিয়ন, হার্টব্রেকার এবং ইগর আর্মার আপনার দিকে আসছে।`,
        action: 'house_party',
        actionLabel: "HOUSE_PARTY_ENGAGED"
      };
    }
    return {
      reply: `House Party Protocol engaged, Commander ${commanderName}. Automated Marks—Silver Centurion, Heartbreaker, Bones, and Igor—are en route to your coordinates.`,
      action: 'house_party',
      actionLabel: "HOUSE_PARTY_ENGAGED"
    };
  }

  // Protocols: Veronica / Hulkbuster
  if (
    matches(
      'veronica', 'hulkbuster', 'heavy armor', 'orbital',
      'ভেরোনিকা', 'হাল্কবাস্টার', 'ভারী স্যুট', 'স্যাটেলাইট',
      'veronica pathao', 'hulkbuster dao'
    )
  ) {
    if (language === 'bn' || matches('ভেরোনিকা', 'হাল্কবাস্টার', 'veronica')) {
      return {
        reply: `ভেরোনিকা স্যাটেলাইট থেকে টেলিমেট্রি নিশ্চিত, কমান্ডার ${commanderName}। নিম্ন কক্ষপথ থেকে ভারী হাল্কবাস্টার আর্মার ড্রপ প্রস্তুত।`,
        action: 'veronica',
        actionLabel: "VERONICA_ORBITAL_LOCKED"
      };
    }
    return {
      reply: `Satellite Veronica orbital telemetry confirmed, Commander ${commanderName}. Heavy reinforcement modules deployed in low orbit, ready for immediate atmospheric drop.`,
      action: 'veronica',
      actionLabel: "VERONICA_ORBITAL_LOCKED"
    };
  }

  // Protocols: Clean Slate
  if (
    matches(
      'clean slate', 'self destruct', 'detonate',
      'ক্লিন স্লেট', 'আত্মবিধ্বংসী', 'বিস্ফোরণ',
      'clean slate chalu koro'
    )
  ) {
    if (language === 'bn' || matches('ক্লিন স্লেট', 'বিস্ফোরণ')) {
      return {
        reply: `ক্লিন স্লেট প্রোটোকল প্রস্তুত, কমান্ডার ${commanderName}। এটি সমস্ত সহায়ক আর্মার ধ্বংস করে দেবে।`,
        action: 'clean_slate',
        actionLabel: "CLEAN_SLATE_ARMED"
      };
    }
    return {
      reply: `Clean Slate Protocol armed, Commander ${commanderName}. Initiating security micro-charges across auxiliary armor chassis.`,
      action: 'clean_slate',
      actionLabel: "CLEAN_SLATE_ARMED"
    };
  }

  // Stealth Mode
  if (
    matches(
      'stealth', 'night ops', 'radar dark', 'silent',
      'স্টিলথ', 'অদৃশ্য মোড', 'লুকানো মোড', 'শান্ত মোড',
      'stealth mode koro'
    )
  ) {
    if (language === 'bn' || matches('স্টিলথ', 'অদৃশ্য', 'stealth')) {
      return {
        reply: `মার্ক ৮৫ ন্যানোটেক এখন রাডার-প্রতিরোধী স্টিলথ ফ্রিকোয়েন্সিতে স্থানান্তরিত, কমান্ডার ${commanderName}।`,
        action: 'toggle_stealth',
        actionLabel: "STEALTH_ENGAGED"
      };
    }
    return {
      reply: `Shifting Mark LXXXV nanotech matrix to radar-absorbent stealth refraction, Commander ${commanderName}.`,
      action: 'toggle_stealth',
      actionLabel: "STEALTH_ENGAGED"
    };
  }

  // Overdrive Combat Mode
  if (
    matches(
      'overdrive', 'combat mode', 'battle mode', 'threat level high',
      'ওভারড্রাইভ', 'যুদ্ধ মোড', 'কমব্যাট', 'সর্বোচ্চ শক্তি',
      'overdrive chalu koro', 'juddho mode'
    )
  ) {
    if (language === 'bn' || matches('ওভারড্রাইভ', 'যুদ্ধ', 'overdrive')) {
      return {
        reply: `কমব্যাট ওভারড্রাইভ সক্রিয়, কমান্ডার ${commanderName}! রিঅ্যাক্টরের ৮৫% অতিরিক্ত শক্তি সরাসরি রিপালসরে পাঠানো হচ্ছে।`,
        action: 'overdrive',
        actionLabel: "COMBAT_OVERDRIVE"
      };
    }
    return {
      reply: `Combat Overdrive engaged, Commander ${commanderName}! Shunting 85% of reactor reserves to flight thrusters and repulsor focal arrays.`,
      action: 'overdrive',
      actionLabel: "COMBAT_OVERDRIVE"
    };
  }

  // Standard Reset
  if (
    matches(
      'standard mode', 'stand down', 'normal mode', 'reset suit',
      'স্বাভাবিক মোড', 'রিসেট', 'আগের অবস্থা',
      'normal koro', 'shavabik koro'
    )
  ) {
    if (language === 'bn' || matches('স্বাভাবিক', 'রিসেট')) {
      return {
        reply: `স্যুট স্বাভাবিক অবস্থায় ফিরে এসেছে, কমান্ডার ${commanderName}। শিল্ড ১০০% স্থিতিশীল।`,
        action: 'standard_mode',
        actionLabel: "STANDARD_TELEMETRY"
      };
    }
    return {
      reply: `Returning Mark LXXXV to standard baseline telemetry, Commander ${commanderName}.`,
      action: 'standard_mode',
      actionLabel: "STANDARD_TELEMETRY"
    };
  }

  // APK / Install commands
  if (
    matches(
      'apk', 'install', 'download', 'android app',
      'এপিকে', 'ইনস্টল', 'ডাউনলোড', 'অ্যাপ ইনস্টল',
      'apk download koro', 'app install koro'
    )
  ) {
    if (language === 'bn' || matches('এপিকে', 'ইনস্টল', 'ডাউনলোড', 'apk')) {
      return {
        reply: `স্টার্ক এপিকে ইনস্টলার খোলা হয়েছে, কমান্ডার ${commanderName}। আপনি সরাসরি আপনার ডিভাইসে এটি ইনস্টল করতে পারেন।`,
        action: 'open_apk',
        actionLabel: "APK_INSTALLER_OPENED"
      };
    }
    return {
      reply: `Opening the Stark APK installer hub, Commander ${commanderName}. You can install Adil J.A.R.V.I.S. directly for 100% offline access.`,
      action: 'open_apk',
      actionLabel: "APK_INSTALLER_OPENED"
    };
  }

  // Mute / Sound
  if (
    matches(
      'mute', 'unmute', 'sound', 'audio',
      'শব্দ বন্ধ', 'মিউট', 'শব্দ চালু',
      'sound bondho', 'sound chalu'
    )
  ) {
    if (language === 'bn' || matches('শব্দ', 'মিউট')) {
      return {
        reply: `অডিও সেটিংস পরিবর্তিত হয়েছে, কমান্ডার ${commanderName}।`,
        action: 'toggle_mute',
        actionLabel: "AUDIO_TOGGLED"
      };
    }
    return {
      reply: `Audio output profile updated, Commander ${commanderName}.`,
      action: 'toggle_mute',
      actionLabel: "AUDIO_TOGGLED"
    };
  }

  // Identity: Who are you?
  if (
    matches(
      'who are you', 'what are you', 'identity',
      'তুমি কে', 'তোমার নাম কি', 'কে তুমি',
      'tumi ke', 'tomar nam ki'
    )
  ) {
    if (language === 'bn' || matches('তুমি কে', 'তোমার নাম', 'tumi ke')) {
      return {
        reply: `আমি ${assistantName} (Just A Rather Very Intelligent System)। আপনার তৈরি করা কৃত্রিম বুদ্ধিমত্তা এবং ব্যক্তিগত সহকারী, কমান্ডার ${commanderName}।`,
      };
    }
    return {
      reply: `I am ${assistantName} (Just A Rather Very Intelligent System). Your tactical artificial intelligence and combat co-pilot, Commander ${commanderName}.`,
    };
  }

  // Greetings
  if (
    matches(
      'how are you', 'kemon acho', 'kemon achho',
      'কেমন আছো', 'কেমন আছেন'
    )
  ) {
    if (language === 'bn' || matches('কেমন আছো', 'kemon acho')) {
      return {
        reply: `আমি চমৎকার আছি কমান্ডার ${commanderName}! আমার অফলাইন নিউরাল কোর এবং আর্ক রিঅ্যাক্টর ১০০% শক্তিতে কাজ করছে। আপনি কেমন আছেন?`,
      };
    }
    return {
      reply: `Functioning at optimal capacity, Commander ${commanderName}. Neural subroutines and Arc core running smoothly.`,
    };
  }

  if (
    matches(
      'hello', 'hey', 'good morning', 'hi',
      'হ্যালো', 'নমস্কার', 'সালাম', 'শুভ সকাল',
      'shuvo shokal'
    )
  ) {
    if (language === 'bn' || matches('হ্যালো', 'নমস্কার', 'সালাম', 'shokal')) {
      return {
        reply: `শুভ দিন, কমান্ডার ${commanderName}! ${assistantName} সম্পূর্ণ প্রস্তুত। কোনো ইন্টারনেট ছাড়াই আমি আপনার প্রতিটি আদেশ পালনে প্রস্তুত। বলুন কি করতে হবে?`,
      };
    }
    return {
      reply: `Good day, Commander ${commanderName}. ${assistantName} is online and operational without requiring external network connectivity. How may I assist?`,
    };
  }

  // Fallback
  if (language === 'bn') {
    const bnGeneral = [
      `আদেশ গৃহীত হয়েছে, কমান্ডার ${commanderName}। স্থানীয় নিউরাল কোর দিয়ে সমস্ত প্রসেসিং সম্পন্ন করা হয়েছে।`,
      `আমি রেকর্ড করেছি, কমান্ডার ${commanderName}। মার্ক ৮৫ সিস্টেম সম্পূর্ণ সতর্কতায় আছে।`,
      `পেরিমিটার স্ক্যান সম্পন্ন, কমান্ডার ${commanderName}। স্থানীয় সিস্টেমে কোনো ত্রুটি নেই।`
    ];
    return {
      reply: bnGeneral[Math.floor(Math.random() * bnGeneral.length)],
    };
  }

  const enGeneral = [
    `Request logged into local tactical registry, Commander ${commanderName}. Mark LXXXV systems remain on high alert.`,
    `Understood, Commander ${commanderName}. Local neural core processed your directive in 14 milliseconds.`,
    `Perimeter telemetry scanned and clear, Commander ${commanderName}. All local subroutines running with zero external latency.`,
    `Right away, Commander ${commanderName}. Local diagnostic array indicates no anomalies across any sector.`
  ];

  return {
    reply: enGeneral[Math.floor(Math.random() * enGeneral.length)],
  };
}
