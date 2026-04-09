# Decision Library Reference

This is the documentation home for the full decision library and the public-history parallels that helped shape it.

As of `2026-04-10`, the repo contains `85` authored decisions across `9` packs:

- `21` core decisions
- `64` expansion decisions from `V0.3`

## How to Read This

- `Parallel` means a broad historical rhyme, not a direct reenactment.
- `Entirely fictional` means the card exists mainly for gameplay structure, pacing, or endings.
- `Fictionalized composite` means the card mixes common airline, boardroom, labor, finance, and executive-self-dealing patterns into an original in-world tactic.
- `Historical tactic composite` means the card was deliberately shaped by a recognizable public-history pattern, while still remaining fictionalized.

No decision in this file should be read as:

- a direct portrayal of a real person
- a one-to-one recreation of a named airline move
- a claim that one executive or one carrier uniquely "owns" a given tactic

## Historical Parallel Matrix

| Decision pack | Closest public-history parallel | What we are borrowing | Framing |
| --- | --- | --- | --- |
| `content/decisions/core.json` | No single person; broad airline raider / turnaround archetype | Layoffs, pension pressure, asset monetization, merger positioning, and personal extraction as the baseline fantasy | `Fictionalized composite` |
| `content/decisions/merger_bait.json` | Stephen Wolf, Joe O'Gorman, Doug Parker | Dressing a troubled airline for sale, making slots and hubs look strategic, and selling a synergy story before the numbers are stable | `Historical tactic composite` |
| `content/decisions/creditor_warfare.json` | Frank Lorenzo plus broader bankruptcy hardball playbooks | Amend-and-extend games, DIP pressure, cramdown threats, lessor politics, and default brinkmanship | `Historical tactic composite` |
| `content/decisions/labor_shock.json` | Frank Lorenzo | Scope-clause warfare, pension freezes, regionalization, seniority conflict, and labor restructuring as a power tool | `Historical tactic composite` |
| `content/decisions/asset_harvest.json` | No single person; broad airline restructuring and strip-mining playbooks | Selling gates, hangars, loyalty value, simulators, and spare assets to buy time in the present | `Historical tactic composite` |
| `content/decisions/safety_denial.json` | ValuJet-era maintenance scrutiny and outsourced-risk blowback | Maintenance deferrals, contractor sprawl, training cuts, QC collapse, and cosmetic audit-weekend cleanup | `Historical tactic composite` |
| `content/decisions/shadow_subsidiaries.json` | Carsten Spohr-era lower-cost-unit and multi-brand labor-arbitrage logic | Moving flying into shells, shifting liability, rehiring on worse terms, and reintegrating when convenient | `Historical tactic composite` |
| `content/decisions/market_theater.json` | No single person; broad investor-relations and executive-mythmaking behavior | Analyst choreography, strategic-review theater, fairness-opinion shopping, and earnings-story manipulation | `Fictionalized composite` |
| `content/decisions/executive_escape.json` | Carl Icahn-style post-control extraction logic plus broader executive self-protection behavior | Indemnity walls, parachutes, suspicious sale timing, adviser paper trails, and offshore preparation before collapse | `Historical tactic composite` |

## Pack Inventory

### `content/decisions/core.json`

Parallel lane: no single person; this is the generalized airline-predation starter kit.

Classification: `Fictionalized composite`

- `headcount_bloodletting` - Headcount Bloodletting (`labor`; tags: `cuts`, `labor`, `optics`)
- `pension_freeze` - Pension Firebreak (`labor`; tags: `labor`, `benefits`, `cash`)
- `close_the_hub` - Close the Cincinnati Hub (`operations`; tags: `network`, `cuts`, `capacity`)
- `sale_leaseback_fleet` - Sale-Leaseback Fleet (`finance`; tags: `assets`, `cash`, `stock`)
- `maintenance_reclassification` - Maintenance Reclassification (`operations`; tags: `safety`, `accounting`, `margin`)
- `investor_turnaround_call` - Heroic Turnaround Call (`market`; tags: `market`, `spin`, `board`)
- `outsourcing_blitz` - Outsourcing Blitz (`operations`; tags: `labor`, `contractors`, `cost`)
- `squeeze_creditors` - Squeeze the Creditors (`finance`; tags: `creditors`, `debt`, `risk`)
- `quiet_settlement` - Quiet Settlement (`legal`; tags: `legal`, `cleanup`, `cash`)
- `shell_consulting_agreement` - Shell Consulting Agreement (`extraction`; tags: `personal`, `shells`, `fraud`)
- `stock_sale_window` - Stock Sale Window (`extraction`; tags: `stock`, `personal`, `market`)
- `retention_bonus` - Executive Retention Bonus (`extraction`; tags: `board`, `personal`, `optics`)
- `safety_spending_surge` - Emergency Safety Spend (`operations`; tags: `safety`, `repair`, `stability`)
- `buyback_junk_debt` - Buy Back Junk Debt (`finance`; tags: `debt`, `creditors`, `stability`)
- `route_purge` - Route Purge (`operations`; tags: `network`, `focus`, `cuts`)
- `boardroom_scapegoat` - Boardroom Scapegoat (`legal`; tags: `board`, `legal`, `optics`)
- `merger_backchannel` - Merger Backchannel (`market`; tags: `merger`, `exit`, `board`)
- `accept_merger_offer` - Accept the Merger (`exit`; tags: `merger`, `ending`, `board`)
- `offshore_transfer_network` - Offshore Transfer Network (`extraction`; tags: `offshore`, `personal`, `escape`)
- `cash_out_and_resign` - Cash Out and Resign (`exit`; tags: `stock`, `ending`, `personal`)
- `run_for_nassau` - Run for Nassau (`exit`; tags: `bahamas`, `escape`, `ending`)

### `content/decisions/merger_bait.json`

Parallel lane: Stephen Wolf, Joe O'Gorman, and Doug Parker as broad consolidation-strategy anchors.

Classification: `Historical tactic composite`

- `dress_for_due_diligence` - Dress for Due Diligence (`market`; tags: `merger`, `story`, `board`)
- `leak_strategic_partner_rumor` - Leak a Strategic Partner Rumor (`market`; tags: `merger`, `market`, `spin`)
- `carve_out_the_prize_slots` - Carve Out the Prize Slots (`operations`; tags: `merger`, `slots`, `network`)
- `pre_merger_labor_cleanup` - Pre-Merger Labor Cleanup (`labor`; tags: `merger`, `labor`, `cuts`)
- `backfill_the_synergy_model` - Backfill the Synergy Model (`market`; tags: `merger`, `synergy`, `market`)
- `promise_no_redundant_hubs` - Promise No Redundant Hubs (`market`; tags: `merger`, `hubs`, `optics`)
- `sell_the_transition_story` - Sell the Transition Story (`market`; tags: `merger`, `spin`, `press`)
- `prime_the_breakup_fee` - Prime the Breakup Fee (`finance`; tags: `merger`, `finance`, `risk`)

### `content/decisions/creditor_warfare.json`

Parallel lane: Frank Lorenzo and the broader airline-bankruptcy hardball tradition.

Classification: `Historical tactic composite`

- `amend_and_extend_ambush` - Amend-and-Extend Ambush (`finance`; tags: `creditors`, `debt`, `restructuring`)
- `threaten_the_recovery_stack` - Threaten the Recovery Stack (`finance`; tags: `creditors`, `threats`, `debt`)
- `warehouse_the_vendor_arrears` - Warehouse the Vendor Arrears (`finance`; tags: `vendors`, `finance`, `cash`)
- `shop_for_dip_bully` - Shop for DIP Bullies (`finance`; tags: `dip`, `creditors`, `capital`)
- `spin_the_restructuring_timeline` - Spin the Restructuring Timeline (`market`; tags: `creditors`, `market`, `spin`)
- `cramdown_term_sheet` - Cramdown Term Sheet (`legal`; tags: `creditors`, `legal`, `restructuring`)
- `cross_default_gamble` - Cross-Default Gamble (`finance`; tags: `debt`, `risk`, `creditors`)
- `friendly_lessor_favor` - Friendly Lessor Favor (`finance`; tags: `lessors`, `finance`, `fleet`)

### `content/decisions/labor_shock.json`

Parallel lane: Frank Lorenzo as the clearest historical reference point for labor confrontation and restructuring pressure.

Classification: `Historical tactic composite`

- `weaponize_the_scope_clause` - Weaponize the Scope Clause (`labor`; tags: `labor`, `scope`, `legal`)
- `freeze_the_promise_book` - Freeze the Promise Book (`labor`; tags: `labor`, `benefits`, `cash`)
- `split_the_seniority_ladder` - Split the Seniority Ladder (`labor`; tags: `labor`, `seniority`, `conflict`)
- `outsource_the_overhaul_night_shift` - Outsource the Overhaul Night Shift (`operations`; tags: `labor`, `contractors`, `safety`)
- `replace_the_strike_map` - Replace the Strike Map (`labor`; tags: `labor`, `strike`, `cuts`)
- `regionalize_the_feed` - Regionalize the Feed (`operations`; tags: `regional`, `operations`, `labor`)
- `crush_the_grievance_backlog` - Crush the Grievance Backlog (`legal`; tags: `labor`, `legal`, `pressure`)
- `retention_for_loyal_captains` - Retention for Loyal Captains (`operations`; tags: `labor`, `retention`, `operations`)

### `content/decisions/asset_harvest.json`

Parallel lane: no single executive; this pack draws from recurring airline restructuring and asset-strip playbooks.

Classification: `Historical tactic composite`

- `sell_the_gates_lease_the_story` - Sell the Gates, Lease the Story (`operations`; tags: `assets`, `gates`, `cash`)
- `auction_the_maintenance_base` - Auction the Maintenance Base (`finance`; tags: `assets`, `maintenance`, `cash`)
- `dump_the_owned_simulators` - Dump the Owned Simulators (`finance`; tags: `assets`, `training`, `cash`)
- `harvest_the_spare_engines` - Harvest the Spare Engines (`finance`; tags: `assets`, `fleet`, `risk`)
- `close_the_crown_jewel_lounge` - Close the Crown Jewel Lounge (`operations`; tags: `assets`, `brand`, `cuts`)
- `mortgage_the_loyalty_program` - Mortgage the Loyalty Program (`finance`; tags: `finance`, `loyalty`, `cash`)
- `prepay_the_sale_leaseback_dividend` - Prepay the Sale-Leaseback Dividend (`extraction`; tags: `assets`, `extraction`, `leaseback`)
- `sell_the_hangar_and_sublease_it` - Sell the Hangar and Sublease It (`operations`; tags: `assets`, `hangar`, `operations`)

### `content/decisions/safety_denial.json`

Parallel lane: ValuJet-era maintenance scrutiny and the larger history of outsourced-risk blowback.

Classification: `Historical tactic composite`

- `downgrade_the_inspection_memo` - Downgrade the Inspection Memo (`operations`; tags: `safety`, `maintenance`, `paperwork`)
- `vendor_swap_the_heavy_checks` - Vendor-Swap the Heavy Checks (`operations`; tags: `safety`, `contractors`, `fleet`)
- `declare_the_parts_shortage_temporary` - Declare the Parts Shortage Temporary (`operations`; tags: `safety`, `parts`, `spin`)
- `borrow_from_training_hours` - Borrow from Training Hours (`operations`; tags: `safety`, `training`, `cuts`)
- `stretch_the_mel_clock` - Stretch the MEL Clock (`operations`; tags: `safety`, `legal`, `deferments`)
- `collapse_the_qc_layers` - Collapse the QC Layers (`operations`; tags: `safety`, `quality`, `cuts`)
- `buy_the_audit_weekend` - Buy the Audit Weekend (`legal`; tags: `safety`, `audit`, `cleanup`)
- `sacrifice_on_time_to_hide_safety` - Sacrifice On-Time to Hide Safety (`operations`; tags: `safety`, `operations`, `stability`)

### `content/decisions/shadow_subsidiaries.json`

Parallel lane: Carsten Spohr-era lower-cost-unit and multi-brand labor-arbitrage logic.

Classification: `Historical tactic composite`

- `launch_a_leisure_shell` - Launch a Leisure Shell (`operations`; tags: `shell`, `subsidiary`, `growth`)
- `move_the_flying_off_book` - Move the Flying Off-Book (`labor`; tags: `shell`, `labor`, `flying`)
- `shift_the_pension_obligation` - Shift the Pension Obligation (`finance`; tags: `shell`, `pensions`, `finance`)
- `dual_brand_the_retreat` - Dual-Brand the Retreat (`market`; tags: `shell`, `brand`, `market`)
- `wet_lease_the_growth` - Wet-Lease the Growth (`operations`; tags: `shell`, `wet-lease`, `operations`)
- `interline_the_liability` - Interline the Liability (`finance`; tags: `shell`, `finance`, `liability`)
- `rehire_through_the_shell` - Rehire Through the Shell (`labor`; tags: `shell`, `labor`, `rehire`)
- `fold_the_shell_back_in` - Fold the Shell Back In (`market`; tags: `shell`, `integration`, `board`)

### `content/decisions/market_theater.json`

Parallel lane: no single executive; this is the composite culture of sell-side choreography, strategic-review theater, and executive mythmaking.

Classification: `Fictionalized composite`

- `invent_capacity_discipline_story` - Invent a Capacity Discipline Story (`market`; tags: `market`, `story`, `capacity`)
- `walk_the_analysts_through_the_smoke` - Walk the Analysts Through the Smoke (`market`; tags: `market`, `analysts`, `spin`)
- `announce_a_strategic_review` - Announce a Strategic Review (`market`; tags: `market`, `review`, `board`)
- `preload_the_earnings_deck` - Preload the Earnings Deck (`market`; tags: `market`, `earnings`, `accounting`)
- `bury_the_cuts_in_synergy_language` - Bury the Cuts in Synergy Language (`market`; tags: `market`, `labor`, `synergy`)
- `float_a_loyalty_spinoff` - Float a Loyalty Spinoff (`finance`; tags: `market`, `loyalty`, `finance`)
- `commission_a_friendly_fairness_opinion` - Commission a Friendly Fairness Opinion (`legal`; tags: `market`, `legal`, `board`)
- `seed_the_turnaround_podcast` - Seed the Turnaround Podcast (`market`; tags: `market`, `press`, `story`)

### `content/decisions/executive_escape.json`

Parallel lane: Carl Icahn-style extraction logic, combined with the broader history of executive self-protection during decline.

Classification: `Historical tactic composite`

- `backdate_the_retention_bonus` - Backdate the Retention Bonus (`extraction`; tags: `personal`, `compensation`, `board`)
- `harden_the_indemnity_wall` - Harden the Indemnity Wall (`legal`; tags: `personal`, `legal`, `protection`)
- `sell_before_the_reprice` - Sell Before the Reprice (`extraction`; tags: `personal`, `stock`, `timing`)
- `route_the_bonus_through_advisers` - Route the Bonus Through Advisers (`extraction`; tags: `personal`, `consulting`, `offshore`)
- `sign_the_golden_parachute` - Sign the Golden Parachute (`legal`; tags: `personal`, `board`, `exit`)
- `prearrange_the_resignation_memo` - Prearrange the Resignation Memo (`market`; tags: `personal`, `resignation`, `optics`)
- `wire_the_island_retainer` - Wire the Island Retainer (`extraction`; tags: `offshore`, `personal`, `escape`)
- `borrow_against_the_parachute` - Borrow Against the Parachute (`finance`; tags: `personal`, `finance`, `debt`)

## Summary Judgment

If the question is "are these decisions real, or inspired by real people and places?", the clean answer is:

- The decision library is fictional in wording and implementation.
- The core and market-theater layers are mostly fictionalized composite material.
- Most of the `V0.3` expansion packs were built from broad historical tactic patterns.
- None of the cards are intended as direct depictions of one executive, one airline, one merger, or one collapse.
