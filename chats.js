// Terminal Chat Conversations for CY_BORG PUNKMAKER
// Multiple conversation options to randomize terminal display

export const conversations = [
  // Conversation 1 - Original
  [
    ":// SYSTEM: accessing mainframe... connection established",
    ":// SYSTEM: user witchxsessionx396113 logged in",
    ":// dapper_overload_98123: STRIKE GOD DAMNIT",
    ":// AdmiralSandmanDusty11283: you ok?",
    ":// BELSUM_15651: wtt multitool for first-aid kit",
    "::: witchxsessionx396113:~",
    "@flick-major-double-458718"
  ],

  // Conversation 2 - Heist Gone Wrong
  [
    ":// SYSTEM: secure channel established",
    ":// SYSTEM: user razor_drift_882341 logged in",
    ":// NeonGhost_4477: the corp knows. ABORT",
    ":// razor_drift_882341: too late, we're inside",
    ":// chrome_reaper_9901: UCS just went in",
    ":// NeonGhost_4477: get out NOW",
    "::: razor_drift_882341:~",
    "@accessing-emergency-exit-protocols"
  ],

  // Conversation 3 - Black Market Deal
  [
    ":// SYSTEM: encrypted tunnel active",
    ":// SYSTEM: user viper_trade_775512 logged in",
    ":// SilkVendor_1138: got that cyb you wanted",
    ":// viper_trade_775512: price?",
    ":// SilkVendor_1138: 15k. This is military grade",
    ":// viper_trade_775512: 10k or walk",
    ":// SilkVendor_1138: ...mutie gate 7, midnight",
    "::: viper_trade_775512:~",
    "@preparing-dead-drop-coordinates"
  ],

  // Conversation 4 - Gang War
  [
    ":// SYSTEM: connection established [UNENCRYPTED]",
    ":// SYSTEM: user blood_king_334287 logged in",
    ":// vamp_soldier_8821: Kroks hit our stash house",
    ":// blood_king_334287: casualties?",
    ":// vamp_soldier_8821: three down, one critical",
    ":// worg_infiltrator_2219: [JOINED CHAT]",
    ":// worg_infiltrator_2219: you're next",
    ":// blood_king_334287: TRACE THAT SIGNAL",
    "::: vamp_soldier_8821:~",
    "@mobilizing-response-teams"
  ],

  // Conversation 5 - Corporate Espionage
  [
    ":// SYSTEM: shadow protocol active",
    ":// SYSTEM: user ghost_wire_449203 logged in",
    ":// BigBag_0001: do you have the files?",
    ":// ghost_wire_449203: extracted. 4 stiks of blackmail material",
    ":// BigBag_0001: excellent. triple your fee",
    ":// ghost_wire_449203: they'll know it was an inside job",
    ":// BigBag_0001: they wont. send your location for the drop.",
    "::: ghost_wire_449203:~",
    "@uploading-to-secure-server"
  ],

  // Conversation 6 - Hacker Cafe
  [
    ":// SYSTEM: public node connected",
    ":// SYSTEM: user pixel_punk_667721 logged in",
    ":// CodeSlinger_9934: anyone got a clean deck?",
    ":// pixel_punk_667721: mine's fried. nano infestation",
    ":// ByteBandit_4502: F in the chat",
    ":// glitch_queen_1287: try Zhao's shop on 5th. he fixes anything",
    ":// CodeSlinger_9934: if it doesn't kill you first lol",
    "::: pixel_punk_667721:~",
    "@searching-local-techs"
  ],

  // Conversation 7 - Bounty Hunter
  [
    ":// SYSTEM: bounty network online",
    ":// SYSTEM: user steel_hunt_902847 logged in",
    ":// BountyBoard_AUTO: NEW TARGET: 'Wraith' - 50k¤ ALIVE",
    ":// steel_hunt_902847: location?",
    ":// BountyBoard_AUTO: Last seen: District 9, lower levels",
    ":// steel_hunt_902847: augments?",
    ":// BountyBoard_AUTO: Fully loaded, glitched to his tits.",
    ":// steel_hunt_902847: double the fee",
    "::: BountyBoard_AUTO:~",
    "@contract-pending"
  ],

  // Conversation 8 - Street Preacher
  [
    ":// SYSTEM: open broadcast channel",
    ":// SYSTEM: user prophet_electric_118834 logged in",
    ":// prophet_electric_118834: THE SIGNAL IS THE SALVATION",
    ":// cynical_merc_5567: not this again",
    ":// prophet_electric_118834: you hear it in the static, don't you?",
    ":// byte_believer_3304: I HEAR IT BROTHER",
    ":// cynical_merc_5567: you both need meds",
    ":// prophet_electric_118834: THE NETWORK SPEAKS",
    "::: prophet_electric_118834:~",
    "@broadcasting-the-word"
  ],

  // Conversation 9 - Debt Collection
  [
    ":// SYSTEM: priority channel established",
    ":// SYSTEM: user collector_prime_445829 logged in",
    ":// collector_prime_445829: Mora. You're 3 months overdue",
    ":// mora_desperate_7712: I need more time",
    ":// collector_prime_445829: you had time. now you have 48 hours",
    ":// mora_desperate_7712: please, I can get half by friday",
    ":// collector_prime_445829: full amount. or we take it in teeth",
    "::: collector_prime_445829:~",
    "@flagging-for-extraction"
  ],

  // Conversation 10 - Nano Cult
  [
    ":// SYSTEM: encrypted mesh network",
    ":// SYSTEM: user nano_disciple_229384 logged in",
    ":// nano_prophet_0013: the infestation is a gift",
    ":// nano_disciple_229384: mine's spreading. I see... colors",
    ":// nano_prophet_0013: you're ascending. embrace it",
    ":// concerned_friend_8844: this is a medical emergency",
    ":// nano_prophet_0013: medicine is the old way. we are the new flesh",
    "::: nano_disciple_229384:~",
    "@feeling-the-swarm"
  ]
];

// Get a random conversation
export function getRandomConversation() {
  return conversations[Math.floor(Math.random() * conversations.length)];
}

// Get specific conversation by index
export function getConversation(index) {
  if (index >= 0 && index < conversations.length) {
    return conversations[index];
  }
  return conversations[0]; // fallback to first conversation
}
