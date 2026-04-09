# Event Library Reference

This is the documentation home for the full event library and the public-history parallels that helped shape its fallout.

As of `2026-04-10`, the repo contains `117` authored events:

- `62` ambient events
- `55` delayed events

## How to Read This

- `Parallel` means a broad historical rhyme, not a documentary retelling.
- `Entirely fictional` means the event exists mainly for pacing, pressure balancing, or tonal relief.
- `Fictionalized composite` means the event blends common airline, legal, labor, board, press, and finance patterns into an original in-world beat.
- `Historical tactic composite` means the event was deliberately shaped by a recognizable public-history pattern while remaining fictionalized.

No event in this file should be read as:

- a direct portrayal of a real person
- a direct retelling of a single historical incident
- a claim that one real executive or one real airline uniquely "owns" a given event

## Historical Parallel Matrix

| Event pack | Closest public-history parallel | What we are borrowing | Framing |
| --- | --- | --- | --- |
| `content/events/ambient_board_market.json` | No single person; broad airline boardroom and activist-investor pressure | Downgrades, whisper campaigns, advisory skepticism, and consolidation gossip around a weak carrier | `Fictionalized composite` |
| `content/events/ambient_finance.json` | No single person; recurring distressed-airline liquidity pressure | Fuel, insurance, covenant, airport-fee, vendor, and rumor cycles that squeeze a shaky operator | `Fictionalized composite` |
| `content/events/ambient_labor.json` | Frank Lorenzo as distant lineage | Sickouts, open letters, mutinies, pickets, and operational degradation driven by labor conflict | `Fictionalized composite` |
| `content/events/ambient_legal_personal.json` | No single person; generic executive-scandal and investigation fallout | Compliance exits, plaintiffs' clips, political attention, and public embarrassment | `Fictionalized composite` |
| `content/events/ambient_offshore_escape.json` | No single person; offshore self-protection fantasy and shell-structure friction | Bank reference trouble, nominee-service delays, passport issues, and travel-logistics pressure | `Fictionalized composite` |
| `content/events/ambient_operations.json` | No single person; generic airline fragility with some ValuJet-era safety-pressure overlap | Fatigue, parts shortages, ugly service weekends, and operational-publicity spirals | `Fictionalized composite` |
| `content/events/ambient_stabilizers.json` | None; these are deliberate pacing valves | Small positive beats that stop every round from becoming an uninterrupted avalanche | `Entirely fictional` |
| `content/events/core.json` | No single person; foundational fallout layer for the whole game | The first-pass consequences of layoffs, leasebacks, offshore tricks, merger bait, and executive self-dealing | `Fictionalized composite` |
| `content/events/delayed_exit_paths.json` | Stephen Wolf, Joe O'Gorman, Doug Parker, and Carl Icahn as broad exit-strategy anchors | Merger-term-sheet tension, extraction-after-control fallout, and offshore nerves as the endgame sharpens | `Historical tactic composite` |
| `content/events/delayed_labor.json` | Frank Lorenzo | The legal and public aftershocks of aggressive labor restructuring, pension pressure, and access chaos | `Historical tactic composite` |
| `content/events/delayed_operations_finance.json` | Broad airline restructuring playbooks with ValuJet-era scrutiny in the background | Lessor step-ins, covenant leaks, asset pain, maintenance paper trails, and distressed-debt opportunism | `Historical tactic composite` |
| `content/events/delayed_personal_market.json` | No single person; generalized scandal, compensation, and suspicious-sale fallout with some Icahn-logic overlap | Analyst reversals, leak cycles, guidance corrections, and personal-paper-trail exposure | `Fictionalized composite` |
| `content/events/delayed_strategy_fallout.json` | The full `V0.3` anchor set: Stephen Wolf, Joe O'Gorman, Frank Lorenzo, Carl Icahn, ValuJet-era scrutiny, Doug Parker, and Carsten Spohr | The most explicit fallout layer for merger grooming, creditor warfare, labor arbitrage, safety denial, shells, and executive protection | `Historical tactic composite` |

## Pack Inventory

### `content/events/ambient_board_market.json`

Parallel lane: no single executive; this pack captures the general boardroom and market weather around a distressed airline.

Classification: `Fictionalized composite`

- `buy_side_downgrade_wave` - Buy-Side Downgrade Wave (`ambient`; tags: `market`, `board`)
- `short_seller_chartbook` - Short Seller Chartbook (`ambient`; tags: `market`, `press`)
- `activist_shadow_deck` - Activist Shadow Deck (`ambient`; tags: `board`, `finance`)
- `ratings_watch_negative` - Ratings Watch Negative (`ambient`; tags: `finance`, `creditors`)
- `turnaround_podcast_bump` - Turnaround Podcast Bump (`ambient`; tags: `market`, `positive`)
- `proxy_adviser_sideeye` - Proxy Adviser Side-Eye (`ambient`; tags: `board`, `legal`)
- `lender_listening_tour` - Lender Listening Tour (`ambient`; tags: `creditors`, `board`)
- `private_equity_driveby` - Private Equity Drive-By (`ambient`; tags: `market`, `finance`)

### `content/events/ambient_finance.json`

Parallel lane: no single person; this is the composite pressure of distressed-airline liquidity and rumor cycles.

Classification: `Fictionalized composite`

- `fuel_hedge_embarrassment` - Fuel Hedge Embarrassment (`ambient`; tags: `finance`, `market`)
- `insurance_repricing_notice` - Insurance Repricing Notice (`ambient`; tags: `finance`, `safety`)
- `vendor_prepay_demand` - Vendor Prepay Demand (`ambient`; tags: `finance`, `operations`)
- `airport_fee_standoff` - Airport Fee Standoff (`ambient`; tags: `finance`, `operations`)
- `bank_covenant_whitepaper` - Bank Covenant Whitepaper (`ambient`; tags: `finance`, `creditors`)
- `receivables_sale_discount` - Receivables Sale Discount (`ambient`; tags: `finance`, `cash`)
- `tax_lien_rumor` - Tax Lien Rumor (`ambient`; tags: `finance`, `press`)
- `analyst_bid_speculation` - Analyst Bid Speculation (`ambient`; tags: `market`, `positive`)

### `content/events/ambient_labor.json`

Parallel lane: Frank Lorenzo as a distant labor-confrontation reference, without literal reenactment.

Classification: `Fictionalized composite`

- `flight_attendant_sickout` - Flight Attendant Sickout (`ambient`; tags: `labor`, `operations`)
- `mechanics_open_letter` - Mechanics Open Letter (`ambient`; tags: `labor`, `safety`)
- `grievance_avalanche` - Grievance Avalanche (`ambient`; tags: `labor`, `legal`)
- `crew_room_mutiny` - Crew Room Mutiny (`ambient`; tags: `labor`, `service`)
- `station_manager_walkoff` - Station Manager Walkoff (`ambient`; tags: `labor`, `operations`)
- `holiday_picket_images` - Holiday Picket Images (`ambient`; tags: `labor`, `press`)
- `reserve_pilot_drought` - Reserve Pilot Drought (`ambient`; tags: `operations`, `labor`)
- `call_center_meltdown` - Call Center Meltdown (`ambient`; tags: `operations`, `press`)

### `content/events/ambient_legal_personal.json`

Parallel lane: no single executive; this pack covers the generic scandal-and-investigation blowback that follows visible self-dealing.

Classification: `Fictionalized composite`

- `ag_inquiry_letter` - Attorney General Inquiry (`ambient`; tags: `legal`, `government`)
- `ethics_hotline_spike` - Ethics Hotline Spike (`ambient`; tags: `legal`, `personal`)
- `compliance_resignation` - Compliance Resignation (`ambient`; tags: `legal`, `board`)
- `plaintiffs_forum_clip` - Plaintiffs Forum Clip (`ambient`; tags: `legal`, `press`)
- `local_news_ambush` - Local News Ambush (`ambient`; tags: `press`, `personal`)
- `preservation_notice` - Preservation Notice (`ambient`; tags: `legal`, `board`)
- `donor_gala_backlash` - Donor Gala Backlash (`ambient`; tags: `personal`, `press`)
- `senate_staff_call` - Senate Staff Call (`ambient`; tags: `government`, `legal`)

### `content/events/ambient_offshore_escape.json`

Parallel lane: no single person; this is the composite bureaucracy and optics of offshore escape planning.

Classification: `Fictionalized composite`

- `customs_attention_ping` - Customs Attention Ping (`ambient`; tags: `offshore`, `legal`)
- `nominee_service_delay` - Nominee Service Delay (`ambient`; tags: `offshore`, `legal`)
- `island_bank_reference_request` - Island Bank Reference Request (`ambient`; tags: `offshore`, `finance`)
- `trust_registrar_mixup` - Trust Registrar Mix-Up (`ambient`; tags: `offshore`, `personal`)
- `concierge_press_photo` - Concierge Press Photo (`ambient`; tags: `personal`, `press`)
- `villa_wire_delay` - Villa Wire Delay (`ambient`; tags: `offshore`, `personal`)
- `passport_office_delay` - Passport Office Delay (`ambient`; tags: `offshore`, `escape`)
- `coral_capital_intro` - Coral Capital Intro (`ambient`; tags: `offshore`, `positive`)

### `content/events/ambient_operations.json`

Parallel lane: no single airline; this pack captures the everyday fragility of a weakened operation, with some public maintenance-scrutiny echoes in tone.

Classification: `Fictionalized composite`

- `baggage_mountain_weekend` - Baggage Mountain Weekend (`ambient`; tags: `operations`, `service`)
- `dispatcher_fatigue_warning` - Dispatcher Fatigue Warning (`ambient`; tags: `operations`, `safety`)
- `gate_system_brownout` - Gate System Brownout (`ambient`; tags: `operations`, `service`)
- `winter_irrops_memory` - Winter IROPS Memory (`ambient`; tags: `operations`, `press`)
- `spare_parts_drought` - Spare Parts Drought (`ambient`; tags: `operations`, `safety`)
- `diverted_weekend` - Diverted Weekend (`ambient`; tags: `operations`, `service`)
- `catering_contract_slip` - Catering Contract Slip (`ambient`; tags: `operations`, `service`)
- `runway_photo_cycle` - Runway Photo Cycle (`ambient`; tags: `operations`, `press`)

### `content/events/ambient_stabilizers.json`

Parallel lane: none; these exist to give the simulation breathing room.

Classification: `Entirely fictional`

- `quiet_labor_detente` - Quiet Labor Detente (`ambient`; tags: `labor`, `positive`)
- `insurer_relief_memo` - Insurer Relief Memo (`ambient`; tags: `safety`, `positive`)
- `analyst_upgrade_note` - Analyst Upgrade Note (`ambient`; tags: `market`, `positive`)
- `debt_desk_sympathy_bid` - Debt Desk Sympathy Bid (`ambient`; tags: `finance`, `positive`)
- `weather_break_bonus` - Weather Break Bonus (`ambient`; tags: `operations`, `positive`)
- `boardroom_breathing_room` - Boardroom Breathing Room (`ambient`; tags: `board`, `positive`)
- `frequent_flyer_stickiness` - Frequent Flyer Stickiness (`ambient`; tags: `operations`, `positive`)
- `regulator_other_target` - Regulator Finds Another Target (`ambient`; tags: `legal`, `positive`)

### `content/events/core.json`

Parallel lane: no single person; this is the base consequence layer for the whole game.

Classification: `Fictionalized composite`

- `whistleblower_letter` - Whistleblower Letter (`delayed`; tags: `labor`, `legal`)
- `pension_class_action` - Pension Class Action (`delayed`; tags: `labor`, `legal`)
- `hub_delay_cascade` - Delay Cascade (`delayed`; tags: `operations`, `service`)
- `leaseback_bill_shock` - Leaseback Bill Shock (`delayed`; tags: `finance`, `assets`)
- `maintenance_near_miss` - Maintenance Near Miss (`delayed`; tags: `safety`, `legal`)
- `contractor_walkout` - Contractor Walkout (`delayed`; tags: `labor`, `operations`)
- `creditor_revolt` - Creditor Revolt (`delayed`; tags: `creditors`, `legal`)
- `shell_invoice_exposed` - Shell Invoice Exposed (`delayed`; tags: `personal`, `legal`)
- `insider_trade_whispers` - Insider Trade Whispers (`delayed`; tags: `stock`, `legal`)
- `executive_perk_backlash` - Executive Perk Backlash (`delayed`; tags: `personal`, `press`)
- `merger_interest` - Merger Interest (`delayed`; tags: `merger`, `board`)
- `offshore_auditor_ping` - Offshore Auditor Ping (`delayed`; tags: `offshore`, `legal`)
- `analyst_relief_rally` - Analyst Relief Rally (`ambient`; tags: `market`, `positive`)
- `union_picket_lines` - Union Picket Lines (`ambient`; tags: `labor`, `press`)
- `airport_authority_warning` - Airport Authority Warning (`ambient`; tags: `operations`, `creditors`)
- `tabloid_profile` - Tabloid Profile (`ambient`; tags: `press`, `personal`)
- `board_revolt` - Board Revolt (`ambient`; tags: `board`, `legal`)
- `quiet_quarter` - Quiet Quarter (`ambient`; tags: `positive`, `ops`)

### `content/events/delayed_exit_paths.json`

Parallel lane: Stephen Wolf, Joe O'Gorman, Doug Parker, and Carl Icahn as broad endgame and extraction anchors.

Classification: `Historical tactic composite`

- `chauffeur_receipt_dump` - Chauffeur Receipt Dump (`delayed`; tags: `personal`, `press`)
- `slot_value_diligence` - Slot Value Diligence (`delayed`; tags: `merger`, `board`)
- `merger_term_sheet` - Merger Term Sheet (`delayed`; tags: `merger`, `board`)
- `nominee_director_jitters` - Nominee Director Jitters (`delayed`; tags: `offshore`, `legal`)
- `correspondent_bank_query` - Correspondent Bank Query (`delayed`; tags: `offshore`, `legal`)

### `content/events/delayed_labor.json`

Parallel lane: Frank Lorenzo and the aftershocks of aggressive labor restructuring.

Classification: `Historical tactic composite`

- `faa_exit_interviews` - FAA Exit Interviews (`delayed`; tags: `labor`, `legal`)
- `severance_injunction` - Severance Injunction (`delayed`; tags: `labor`, `legal`)
- `pension_freeze_probe` - Pension Freeze Probe (`delayed`; tags: `labor`, `legal`)
- `retiree_tv_tour` - Retiree TV Tour (`delayed`; tags: `labor`, `press`)
- `badge_access_chaos` - Badge Access Chaos (`delayed`; tags: `operations`, `labor`)
- `vendor_safety_dispute` - Vendor Safety Dispute (`delayed`; tags: `operations`, `safety`)

### `content/events/delayed_operations_finance.json`

Parallel lane: broad airline restructuring and asset-pressure history, with maintenance-scrutiny echoes in the background.

Classification: `Historical tactic composite`

- `slot_auction_humiliation` - Slot Auction Humiliation (`delayed`; tags: `operations`, `assets`)
- `regional_feed_unravels` - Regional Feed Unravels (`delayed`; tags: `operations`, `service`)
- `maintenance_paper_trail` - Maintenance Paper Trail (`delayed`; tags: `safety`, `legal`)
- `faa_ramp_audit` - FAA Ramp Audit (`delayed`; tags: `safety`, `legal`)
- `lessor_step_in_clause` - Lessor Step-In Clause (`delayed`; tags: `finance`, `assets`)
- `lease_reserve_trueup` - Lease Reserve True-Up (`delayed`; tags: `finance`, `creditors`)
- `covenant_leak` - Covenant Leak (`delayed`; tags: `creditors`, `press`)
- `distressed_debt_pack_hunt` - Distressed Debt Pack Hunt (`delayed`; tags: `creditors`, `finance`)

### `content/events/delayed_personal_market.json`

Parallel lane: no single executive; this is the generalized fallout of suspicious sales, compensation leaks, and story-management failure.

Classification: `Fictionalized composite`

- `analyst_model_walkback` - Analyst Model Walkback (`delayed`; tags: `market`, `press`)
- `call_transcript_supercut` - Call Transcript Supercut (`delayed`; tags: `market`, `press`)
- `earnings_guidance_correction` - Guidance Correction (`delayed`; tags: `market`, `legal`)
- `consulting_conflict_memo` - Consulting Conflict Memo (`delayed`; tags: `personal`, `legal`)
- `invoice_rounding_pattern` - Invoice Rounding Pattern (`delayed`; tags: `personal`, `legal`)
- `suspicious_10b5_window` - Suspicious 10b5 Window (`delayed`; tags: `stock`, `legal`)
- `broker_chat_subpoena` - Broker Chat Subpoena (`delayed`; tags: `stock`, `legal`)
- `compensation_deck_leak` - Compensation Deck Leak (`delayed`; tags: `personal`, `press`)

### `content/events/delayed_strategy_fallout.json`

Parallel lane: the full `V0.3` anchor set: Stephen Wolf, Joe O'Gorman, Frank Lorenzo, Carl Icahn, ValuJet-era scrutiny, Doug Parker, and Carsten Spohr.

Classification: `Historical tactic composite`

- `synergy_diligence_snoop` - Synergy Diligence Snoop (`delayed`; tags: `merger`, `legal`)
- `route_overlap_chart` - Route Overlap Chart (`delayed`; tags: `merger`, `operations`)
- `gate_covenant_trap` - Gate Covenant Trap (`delayed`; tags: `finance`, `operations`)
- `seniority_map_fight` - Seniority Map Fight (`delayed`; tags: `labor`, `legal`)
- `scope_clause_arbitration` - Scope Clause Arbitration (`delayed`; tags: `labor`, `legal`)
- `covenant_default_clock` - Covenant Default Clock (`delayed`; tags: `creditors`, `finance`)
- `lender_cooperation_cracks` - Lender Cooperation Cracks (`delayed`; tags: `creditors`, `finance`)
- `vendor_lien_blitz` - Vendor Lien Blitz (`delayed`; tags: `finance`, `operations`)
- `inspection_memo_leak` - Inspection Memo Leak (`delayed`; tags: `operations`, `legal`)
- `parts_cannibalization` - Parts Cannibalization (`delayed`; tags: `operations`, `safety`)
- `shell_route_map_leak` - Shell Route Map Leak (`delayed`; tags: `market`, `labor`)
- `nominee_structure_leak` - Nominee Structure Leak (`delayed`; tags: `offshore`, `legal`)
- `fairness_opinion_underfire` - Fairness Opinion Under Fire (`delayed`; tags: `market`, `legal`)
- `turnaround_story_cracks` - Turnaround Story Cracks (`delayed`; tags: `market`, `press`)
- `director_indemnity_alarm` - Director Indemnity Alarm (`delayed`; tags: `board`, `legal`)
- `customs_broker_ping` - Customs Broker Ping (`delayed`; tags: `offshore`, `legal`)

## Summary Judgment

If the question is "are these events real, or inspired by real people and places?", the clean answer is:

- The event library is fictional in wording and implementation.
- Most of it is fictionalized composite material.
- The `V0.3` delayed-fallout layer is the most consciously shaped by broad public airline-history tactics.
- None of it is meant to be read as a direct dramatization of one executive, one merger, one bankruptcy, or one disaster.
