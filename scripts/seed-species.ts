/**
 * Comprehensive US Saltwater Recreational Species Seed Script
 *
 * Run with: npx tsx scripts/seed-species.ts
 *
 * This script is idempotent - safe to re-run. It will:
 * 1. Create/update species categories
 * 2. Create/update species (matched by slug)
 * 3. Create/update aliases
 * 4. Preserve all existing boat_species associations
 */

import { db } from "../src/lib/db";
import { speciesCategories, species, speciesAliases, boatSpecies } from "../src/lib/db/schema";
import { eq, sql } from "drizzle-orm";

// ============================================================
// Categories
// ============================================================

interface CategoryDef {
  name: string;
  slug: string;
  sortOrder: number;
  description: string;
}

const CATEGORIES: CategoryDef[] = [
  { name: "Snappers", slug: "snappers", sortOrder: 1, description: "Popular reef and bottom fish found throughout the Gulf of Mexico, South Atlantic, and Caribbean waters." },
  { name: "Groupers", slug: "groupers", sortOrder: 2, description: "Prized bottom-dwelling fish known for their size and flavor, found in warm Atlantic and Gulf waters." },
  { name: "Tunas", slug: "tunas", sortOrder: 3, description: "Powerful open-ocean predators prized for speed, fight, and exceptional table fare." },
  { name: "Mackerels", slug: "mackerels", sortOrder: 4, description: "Fast-swimming pelagic fish popular for trolling and live-bait fishing along the coast." },
  { name: "Billfish", slug: "billfish", sortOrder: 5, description: "The ultimate offshore game fish, known for spectacular aerial displays and raw power." },
  { name: "Jacks & Pompanos", slug: "jacks-pompanos", sortOrder: 6, description: "Hard-fighting fish found from the surf to open water, including some of the best-tasting species in the sea." },
  { name: "Drums & Croakers", slug: "drums-croakers", sortOrder: 7, description: "Inshore and nearshore favorites found in bays, estuaries, and along beaches throughout the Atlantic and Gulf coasts." },
  { name: "Flatfish", slug: "flatfish", sortOrder: 8, description: "Bottom-hugging species prized for their delicate, mild-flavored fillets." },
  { name: "Sharks", slug: "sharks", sortOrder: 9, description: "Powerful apex predators that provide some of the most intense fights in saltwater fishing." },
  { name: "Dolphinfish", slug: "dolphinfish", sortOrder: 10, description: "Brilliantly colored, fast-growing pelagic fish found near floating debris and weed lines offshore." },
  { name: "Cobia", slug: "cobia", sortOrder: 11, description: "A powerful, curious fish found near structure, buoys, and rays in warm Atlantic and Gulf waters." },
  { name: "Bass & Bluefish", slug: "bass-bluefish", sortOrder: 12, description: "Iconic inshore and nearshore game fish of the Atlantic coast." },
  { name: "Cod & Pollock", slug: "cod-pollock", sortOrder: 13, description: "Cold-water bottom fish of the Northeast Atlantic, staples of party boat and wreck fishing." },
  { name: "Porgies & Wrasses", slug: "porgies-wrasses", sortOrder: 14, description: "Reef-associated and bottom fish popular from New England to the Southeast." },
  { name: "Rockfish & Lingcod", slug: "rockfish-lingcod", sortOrder: 15, description: "West Coast rockfish, lingcod, and cabezon caught on bottom fishing trips." },
  { name: "Salmon", slug: "salmon", sortOrder: 16, description: "Pacific salmon species targeted on party boats from Alaska to California." },
  { name: "Triggerfish", slug: "triggerfish", sortOrder: 17, description: "Reef-dwelling triggerfish species popular on party boats in the South Atlantic and Gulf of Mexico." },
  { name: "Tilefish", slug: "tilefish", sortOrder: 18, description: "Deep-drop tilefish species prized for their excellent eating quality." },
  { name: "Other Species", slug: "other-species", sortOrder: 19, description: "Additional saltwater species commonly targeted by recreational anglers." },
];

// ============================================================
// Species Data
// ============================================================

interface SpeciesDef {
  name: string;
  slug: string;
  scientificName: string;
  category: string; // matches category slug
  aliases: string[];
  description: string;
}

const SPECIES_DATA: SpeciesDef[] = [
  // ==================== SNAPPERS ====================
  { name: "Red Snapper", slug: "red-snapper", scientificName: "Lutjanus campechanus", category: "snappers", aliases: ["American Red Snapper", "Genuine Red Snapper", "Pargo Colorado"], description: "One of the most sought-after reef fish in the Gulf of Mexico and South Atlantic. Red Snapper are known for their distinctive red coloring, firm white flesh, and excellent flavor. They are typically found near reefs, wrecks, and artificial structures in depths of 60 to 400 feet." },
  { name: "Yellowtail Snapper", slug: "yellowtail-snapper", scientificName: "Ocyurus chrysurus", category: "snappers", aliases: ["Flag", "Rabirubia"], description: "A colorful reef fish found throughout South Florida and the Caribbean. Yellowtail Snapper are easily identified by their distinctive yellow stripe running from snout to tail. They are popular targets for both bottom fishing and chumming near coral reefs." },
  { name: "Mangrove Snapper", slug: "mangrove-snapper", scientificName: "Lutjanus griseus", category: "snappers", aliases: ["Gray Snapper", "Black Snapper", "Mango Snapper"], description: "One of the most common snapper species along the Atlantic and Gulf coasts. Mangrove Snapper inhabit a wide range of habitats from mangrove-lined shorelines to offshore reefs. They are wary biters known for testing an angler's patience and skill." },
  { name: "Mutton Snapper", slug: "mutton-snapper", scientificName: "Lutjanus analis", category: "snappers", aliases: ["Mutton Fish", "Pargo Criollo", "King Snapper"], description: "A large, colorful snapper found around coral reefs, wrecks, and ledges in South Florida and the Caribbean. Mutton Snapper are prized for their excellent flavor and can reach weights over 25 pounds." },
  { name: "Lane Snapper", slug: "lane-snapper", scientificName: "Lutjanus synagris", category: "snappers", aliases: ["Candy Snapper", "Spot Snapper", "Mexican Snapper"], description: "A small but abundant snapper species found throughout the Gulf of Mexico and South Atlantic. Lane Snapper are identified by their pink coloring with yellow stripes and a prominent dark spot near the tail. They are excellent eating and often caught while targeting other reef species." },
  { name: "Vermilion Snapper", slug: "vermilion-snapper", scientificName: "Rhomboplites aurorubens", category: "snappers", aliases: ["Bee Liner", "Beeliners", "Mingo", "Night Snapper"], description: "A smaller snapper found in large schools over hard bottom and reef structure in the Gulf and South Atlantic. Vermilion Snapper are one of the most commonly caught bottom fish on party boats. They are known for their bright red color and excellent mild flavor." },
  { name: "Cubera Snapper", slug: "cubera-snapper", scientificName: "Lutjanus cyanopterus", category: "snappers", aliases: ["Cuban Snapper"], description: "The largest of all Atlantic snapper species, capable of exceeding 100 pounds. Cubera Snapper are found near deepwater ledges, wrecks, and channels in South Florida and the Caribbean. Their powerful build and aggressive fights make them a premier trophy target." },
  { name: "Silk Snapper", slug: "silk-snapper", scientificName: "Lutjanus vivanus", category: "snappers", aliases: ["Yelloweye Snapper", "Day Snapper"], description: "A deepwater snapper found at depths of 300 to 600 feet throughout the Caribbean and southern Gulf of Mexico. Silk Snapper are known for their bright pink-red coloring and yellow eyes. They offer excellent table fare." },
  { name: "Queen Snapper", slug: "queen-snapper", scientificName: "Etelis oculatus", category: "snappers", aliases: ["Night Snapper"], description: "A spectacular deep-drop species found at depths of 400 to 1,500 feet throughout the Caribbean and southern Atlantic. Queen Snapper have a brilliant red coloring and are considered one of the finest-tasting deepwater fish." },
  { name: "Blackfin Snapper", slug: "blackfin-snapper", scientificName: "Lutjanus buccanella", category: "snappers", aliases: [], description: "A deepwater snapper found at depths of 200 to 600 feet in the Caribbean and southern Gulf. Blackfin Snapper are identified by the prominent dark spot at the base of their pectoral fin." },

  // ==================== GROUPERS ====================
  { name: "Red Grouper", slug: "red-grouper", scientificName: "Epinephelus morio", category: "groupers", aliases: [], description: "One of the most commonly caught grouper species in the Gulf of Mexico. Red Grouper are found near rocky bottom, ledges, and reef structure in depths of 60 to 300 feet. They are highly valued for their firm, white, mild-flavored flesh." },
  { name: "Black Grouper", slug: "black-grouper", scientificName: "Mycteroperca bonaci", category: "groupers", aliases: ["Bonaci", "Marbled Grouper"], description: "A large, powerful grouper found throughout the Gulf of Mexico and South Atlantic. Black Grouper are known for their strength and ability to dive into structure when hooked. They are one of the most highly prized grouper species for the table." },
  { name: "Gag Grouper", slug: "gag-grouper", scientificName: "Mycteroperca microlepis", category: "groupers", aliases: ["Gag", "Gray Grouper", "Charcoal Belly"], description: "One of the most popular grouper species along the Gulf and South Atlantic coasts. Gag Grouper are aggressive feeders found near reefs, ledges, and wrecks. They are known for their excellent flavor and firm texture." },
  { name: "Scamp Grouper", slug: "scamp-grouper", scientificName: "Mycteroperca phenax", category: "groupers", aliases: ["Scamp", "Broomtail Grouper"], description: "A medium-sized grouper found over hard bottom and reef structure in the Gulf and South Atlantic. Scamp are widely considered to have the best flavor of any grouper species, with firm, snow-white flesh." },
  { name: "Snowy Grouper", slug: "snowy-grouper", scientificName: "Hyporthodus niveatus", category: "groupers", aliases: ["Golden Grouper"], description: "A deepwater grouper found at depths of 300 to 900 feet along the continental shelf edge. Snowy Grouper are identified by their distinctive white spots on a dark brown body. They are a prized catch on deep-drop trips." },
  { name: "Yellowfin Grouper", slug: "yellowfin-grouper", scientificName: "Mycteroperca venenosa", category: "groupers", aliases: [], description: "A colorful reef grouper found in South Florida and the Caribbean. Yellowfin Grouper are identified by their bright yellow-tipped pectoral fins and ability to change color patterns. They are excellent eating but relatively uncommon." },
  { name: "Yellowedge Grouper", slug: "yellowedge-grouper", scientificName: "Hyporthodus flavolimbatus", category: "groupers", aliases: ["Kitty Mitchell", "Yellowfinned Grouper"], description: "A deepwater grouper found at depths of 200 to 600 feet in the Gulf of Mexico and western Atlantic. Yellowedge Grouper are identified by the yellow margins on their fins and are highly regarded for their table quality." },
  { name: "Yellowmouth Grouper", slug: "yellowmouth-grouper", scientificName: "Mycteroperca interstitialis", category: "groupers", aliases: ["Salmon Grouper"], description: "A medium-sized grouper found on coral reefs throughout South Florida and the Caribbean. Yellowmouth Grouper are identified by the yellow coloring around their mouth and are good table fare." },

  // ==================== TUNAS ====================
  { name: "Yellowfin Tuna", slug: "yellowfin-tuna", scientificName: "Thunnus albacares", category: "tunas", aliases: ["Ahi", "Allison Tuna"], description: "One of the most popular offshore game fish worldwide. Yellowfin Tuna are found in warm waters throughout the Atlantic, Gulf, and Pacific. They are known for their speed, stamina, and outstanding sashimi-grade flesh. Trophy fish can exceed 300 pounds." },
  { name: "Bluefin Tuna", slug: "bluefin-tuna", scientificName: "Thunnus thynnus", category: "tunas", aliases: ["Atlantic Bluefin Tuna", "Giant Bluefin", "Horse Mackerel", "BFT"], description: "The largest and most powerful tuna species, capable of exceeding 1,000 pounds. Atlantic Bluefin Tuna are found from the Gulf of Maine to the Gulf of Mexico. They are among the most valuable fish in the world, with individual fish selling for tens of thousands of dollars." },
  { name: "Blackfin Tuna", slug: "blackfin-tuna", scientificName: "Thunnus atlanticus", category: "tunas", aliases: ["Bermuda Tuna", "Football"], description: "The smallest tuna species in the Atlantic, commonly found in the Gulf of Mexico and Caribbean. Blackfin Tuna are popular light-tackle sport fish that travel in large schools and are excellent for sashimi and grilling." },
  { name: "Bigeye Tuna", slug: "bigeye-tuna", scientificName: "Thunnus obesus", category: "tunas", aliases: ["BET"], description: "A deepwater tuna species prized for its rich, fatty flesh. Bigeye Tuna are found in warm temperate waters of the Atlantic and Pacific. They are typically caught on overnight deep-drop trips and are among the most highly valued sashimi fish." },
  { name: "Skipjack Tuna", slug: "skipjack-tuna", scientificName: "Katsuwonus pelamis", category: "tunas", aliases: ["Striped Tuna", "Arctic Bonito", "Oceanic Bonito"], description: "The most abundant tuna species in the world's oceans. Skipjack Tuna are commonly found in warm waters and are popular targets for light-tackle anglers. They are excellent cut bait for larger game fish and are the primary species used in canned tuna." },
  { name: "Albacore Tuna", slug: "albacore-tuna", scientificName: "Thunnus alalunga", category: "tunas", aliases: ["Longfin Tuna", "White Tuna", "Longfin"], description: "A medium-sized tuna found in temperate waters of the Atlantic and Pacific. Albacore are especially popular along the Pacific coast where they are targeted on long-range sport fishing trips. They are known for their white flesh and are the only tuna that can be labeled 'white meat' tuna." },
  { name: "Little Tunny", slug: "little-tunny", scientificName: "Euthynnus alletteratus", category: "tunas", aliases: ["False Albacore", "Bonito", "Fat Albert", "LT", "Albie"], description: "A small, fast tuna species found throughout the Atlantic and Gulf coasts. Little Tunny are incredibly powerful fighters on light tackle and are popular targets during their seasonal migrations along the coast. They are excellent cut bait and some anglers prize them for smoking." },

  // ==================== MACKERELS ====================
  { name: "King Mackerel", slug: "king-mackerel", scientificName: "Scomberomorus cavalla", category: "mackerels", aliases: ["Kingfish", "King", "Smoker King"], description: "One of the most popular sport fish along the Atlantic and Gulf coasts. King Mackerel are fast, aggressive predators known for their blistering runs and aerial displays. Large fish, called 'smokers,' can exceed 60 pounds and are prized tournament targets." },
  { name: "Spanish Mackerel", slug: "spanish-mackerel", scientificName: "Scomberomorus maculatus", category: "mackerels", aliases: ["Spanish", "Spotted Mackerel"], description: "A popular inshore and nearshore game fish found along the Atlantic and Gulf coasts. Spanish Mackerel are fast swimmers that travel in large schools, making them exciting targets on light tackle. They are excellent smoked or grilled fresh." },
  { name: "Cero Mackerel", slug: "cero-mackerel", scientificName: "Scomberomorus regalis", category: "mackerels", aliases: ["Cero", "Painted Mackerel"], description: "A tropical mackerel species found primarily in the Florida Keys and Caribbean. Cero Mackerel are similar in appearance to King and Spanish Mackerel but have distinctive yellow-orange spots and stripes along their sides." },
  { name: "Wahoo", slug: "wahoo", scientificName: "Acanthocybium solandri", category: "mackerels", aliases: ["Ono", "Pacific Kingfish"], description: "One of the fastest fish in the ocean, capable of speeds exceeding 60 mph. Wahoo are found in tropical and subtropical waters worldwide and are highly prized for both their fight and exceptional table quality. Their firm, white, mild-flavored flesh is considered among the best of all game fish." },
  { name: "Atlantic Bonito", slug: "atlantic-bonito", scientificName: "Sarda sarda", category: "mackerels", aliases: ["Bonito", "Common Bonito"], description: "A fast-swimming member of the mackerel family found throughout the Atlantic. Atlantic Bonito are aggressive feeders that provide exciting light-tackle action. They are commonly caught while trolling or casting to surface-feeding schools." },

  // ==================== BILLFISH ====================
  { name: "Blue Marlin", slug: "blue-marlin", scientificName: "Makaira nigricans", category: "billfish", aliases: ["Atlantic Blue Marlin"], description: "The most iconic big-game fish in the world. Blue Marlin can exceed 1,000 pounds and are found in warm waters throughout the Atlantic, Gulf, and Pacific. Catching a Blue Marlin is considered the pinnacle of offshore fishing achievement." },
  { name: "White Marlin", slug: "white-marlin", scientificName: "Kajikia albida", category: "billfish", aliases: ["Atlantic White Marlin", "Skilligalee"], description: "A smaller, more acrobatic cousin of the Blue Marlin found in the western Atlantic. White Marlin rarely exceed 100 pounds but are renowned for their spectacular aerial displays when hooked. They are a premier light-tackle billfish target." },
  { name: "Sailfish", slug: "sailfish", scientificName: "Istiophorus platypterus", category: "billfish", aliases: ["Atlantic Sailfish", "Sail"], description: "The fastest fish in the ocean, capable of speeds over 68 mph. Sailfish are identified by their spectacular dorsal fin (sail) and are found in warm Atlantic and Gulf waters. South Florida is considered the sailfish capital of the world, with peak season from November through April." },
  { name: "Swordfish", slug: "swordfish", scientificName: "Xiphias gladius", category: "billfish", aliases: ["Broadbill", "Broadbill Swordfish"], description: "A powerful deep-water predator found worldwide in temperate and tropical oceans. Swordfish are typically caught at night using specialized deep-drop techniques with lights. They are one of the most highly valued food fish and can exceed 1,000 pounds." },
  { name: "Spearfish", slug: "spearfish", scientificName: "Tetrapturus pfluegeri", category: "billfish", aliases: ["Longbill Spearfish"], description: "The rarest billfish in the Atlantic, occasionally caught while trolling for other species. Spearfish are smaller than marlin, typically under 50 pounds, and are identified by their shorter bill and more streamlined body." },

  // ==================== JACKS & POMPANOS ====================
  { name: "Greater Amberjack", slug: "greater-amberjack", scientificName: "Seriola dumerili", category: "jacks-pompanos", aliases: ["Amberjack", "AJ", "Reef Donkey"], description: "The largest of the jack family, capable of exceeding 150 pounds. Greater Amberjack are powerful reef-associated fish found near wrecks, rigs, and deep structure. They are nicknamed 'reef donkeys' for their brute strength and stubborn, powerful fights." },
  { name: "Lesser Amberjack", slug: "lesser-amberjack", scientificName: "Seriola fasciata", category: "jacks-pompanos", aliases: [], description: "A smaller cousin of the Greater Amberjack, typically found in deeper water. Lesser Amberjack rarely exceed 10 pounds and are identified by a proportionally larger eye and olive-brown coloring." },
  { name: "Almaco Jack", slug: "almaco-jack", scientificName: "Seriola rivoliana", category: "jacks-pompanos", aliases: ["Almaco", "Longfin Yellowtail", "Almaco Amberjack", "Highfin Amberjack"], description: "A deepwater jack species found near offshore structure and drop-offs. Almaco Jacks are strong fighters that can exceed 40 pounds and are considered excellent table fare, often compared favorably to Yellowtail Snapper." },
  { name: "Crevalle Jack", slug: "crevalle-jack", scientificName: "Caranx hippos", category: "jacks-pompanos", aliases: ["Jack Crevalle", "Jack", "Common Jack", "Toro"], description: "One of the most powerful inshore game fish, pound for pound. Crevalle Jacks are found in bays, inlets, and nearshore waters along the Atlantic and Gulf coasts. They are aggressive feeders that attack both live bait and artificial lures with reckless abandon." },
  { name: "Yellow Jack", slug: "yellow-jack", scientificName: "Carangoides bartholomaei", category: "jacks-pompanos", aliases: [], description: "A smaller jack species found around reefs and wrecks in South Florida and the Caribbean. Yellow Jacks are identified by their distinctive yellow coloring and are considered good table fare, unlike many other jack species." },
  { name: "Blue Runner", slug: "blue-runner", scientificName: "Caranx crysos", category: "jacks-pompanos", aliases: ["Hardtail", "Hardtail Jack", "Runner"], description: "A small, abundant jack species found throughout the Atlantic and Gulf coasts. Blue Runners are popular as both sport fish on ultralight tackle and as premium live bait for larger game fish like King Mackerel and Sailfish." },
  { name: "Florida Pompano", slug: "florida-pompano", scientificName: "Trachinotus carolinus", category: "jacks-pompanos", aliases: ["Pompano", "Carolina Pompano"], description: "One of the most highly prized food fish along the Atlantic and Gulf coasts. Florida Pompano are caught from the surf, piers, and inshore waters using sand fleas, shrimp, and jigs. Their rich, buttery flesh commands premium prices at restaurants." },
  { name: "African Pompano", slug: "african-pompano", scientificName: "Alectis ciliaris", category: "jacks-pompanos", aliases: ["Threadfin Trevally", "Cuban Jack"], description: "A large, deep-bodied jack found near wrecks, reefs, and offshore structure. African Pompano can exceed 50 pounds and are powerful fighters known for their distinctive steep head profile. Juveniles have long, trailing filaments on their dorsal and anal fins." },
  { name: "Bar Jack", slug: "bar-jack", scientificName: "Carangoides ruber", category: "jacks-pompanos", aliases: [], description: "A common reef-associated jack found in South Florida and the Caribbean. Bar Jacks are identified by the dark blue-black stripe running along their back and through the lower lobe of the tail fin. They are considered better table fare than most jack species." },
  { name: "Rainbow Runner", slug: "rainbow-runner", scientificName: "Elagatis bipinnulata", category: "jacks-pompanos", aliases: ["Hawaiian Salmon", "Prodigal Son"], description: "A strikingly colorful open-ocean jack found in tropical waters worldwide. Rainbow Runners are fast swimmers that provide an exciting fight on light tackle. They are excellent table fare with firm, pinkish flesh." },

  // ==================== DRUMS & CROAKERS ====================
  { name: "Red Drum", slug: "red-drum", scientificName: "Sciaenops ocellatus", category: "drums-croakers", aliases: ["Redfish", "Channel Bass", "Puppy Drum", "Red Bass", "Spot Tail"], description: "One of the most iconic inshore game fish in America. Red Drum are found from Massachusetts to Texas in bays, marshes, and along beaches. They are identified by one or more black spots near the tail and are prized for their powerful runs and excellent flavor." },
  { name: "Black Drum", slug: "black-drum", scientificName: "Pogonias cromis", category: "drums-croakers", aliases: ["Drum", "Big Ugly"], description: "The largest member of the drum family, capable of exceeding 100 pounds. Black Drum are found in bays, channels, and near jetties along the Atlantic and Gulf coasts. Smaller fish under 15 pounds are excellent eating, while larger fish are typically released." },
  { name: "Spotted Seatrout", slug: "spotted-seatrout", scientificName: "Cynoscion nebulosus", category: "drums-croakers", aliases: ["Speckled Trout", "Specks", "Trout", "Spotted Weakfish"], description: "One of the most popular inshore game fish from Virginia to Texas. Spotted Seatrout are found in grassy bays, flats, and around oyster bars. They are willing strikers that provide great action on light tackle and are excellent table fare." },
  { name: "Weakfish", slug: "weakfish", scientificName: "Cynoscion regalis", category: "drums-croakers", aliases: ["Grey Trout", "Squeteague", "Yellowfin", "Tiderunner"], description: "A close relative of the Spotted Seatrout found along the mid-Atlantic and Northeast coasts. Weakfish get their name from their delicate mouth tissue that tears easily when hooked. They are beautiful fish with iridescent purple, green, and gold coloring." },
  { name: "Atlantic Croaker", slug: "atlantic-croaker", scientificName: "Micropogonias undulatus", category: "drums-croakers", aliases: ["Croaker", "Hardhead", "Grinder"], description: "A common bottom fish found in bays, estuaries, and nearshore waters along the Atlantic and Gulf coasts. Croakers are named for the drumming sound they produce. They are a popular target for pier and shore anglers and are good eating when fresh." },
  { name: "Spot", slug: "spot-croaker", scientificName: "Leiostomus xanthurus", category: "drums-croakers", aliases: ["Spot", "Norfolk Spot", "Spot Croaker"], description: "A small but popular pan fish found in bays and estuaries of the mid-Atlantic. Spot are identified by the distinctive dark spot behind the gill plate. They are a staple of pier fishing and fish fries throughout the Chesapeake Bay region." },
  { name: "Sheepshead", slug: "sheepshead", scientificName: "Archosargus probatocephalus", category: "porgies-wrasses", aliases: ["Convict Fish", "Sheepie"], description: "A distinctive fish identified by its bold black-and-white vertical stripes and human-like teeth. Sheepshead are found near pilings, jetties, bridges, and oyster bars along the Atlantic and Gulf coasts. They are challenging to hook due to their ability to steal bait but are excellent eating." },
  { name: "Whiting", slug: "whiting", scientificName: "Menticirrhus spp.", category: "drums-croakers", aliases: ["Southern Kingfish", "King Whiting", "Gulf Kingfish", "Northern Kingfish", "Sea Mullet", "Roundhead"], description: "A popular surf and pier fish found along sandy beaches of the Atlantic and Gulf coasts. Several closely related species are grouped as 'Whiting.' They are mild-flavored, easy to catch, and a favorite target for shore-based anglers." },

  // ==================== FLATFISH ====================
  { name: "Summer Flounder", slug: "summer-flounder", scientificName: "Paralichthys dentatus", category: "flatfish", aliases: ["Fluke", "Northern Fluke"], description: "The most popular flatfish species along the Northeast and mid-Atlantic coasts. Summer Flounder are aggressive predators found near sandy bottom, channels, and inshore structure. They are excellent eating with firm, white, mild-flavored flesh and can exceed 20 pounds." },
  { name: "Winter Flounder", slug: "winter-flounder", scientificName: "Pseudopleuronectes americanus", category: "flatfish", aliases: ["Blackback", "Lemon Sole", "Flatfish"], description: "A small but delicious flatfish found in the Northeast Atlantic from the Chesapeake Bay to Canada. Winter Flounder are caught in bays and harbors during cooler months and are prized for their sweet, delicate flesh." },
  { name: "Southern Flounder", slug: "southern-flounder", scientificName: "Paralichthys lethostigma", category: "flatfish", aliases: ["Mud Flounder"], description: "The largest flounder species found in the South Atlantic and Gulf coast bays and estuaries. Southern Flounder are ambush predators that lie camouflaged on sandy or muddy bottom. They are excellent table fare and popular targets for gigging at night." },
  { name: "Gulf Flounder", slug: "gulf-flounder", scientificName: "Paralichthys albigutta", category: "flatfish", aliases: [], description: "A medium-sized flounder found in the Gulf of Mexico and South Atlantic. Gulf Flounder are typically found on sandy bottom near reefs, jetties, and structure in relatively shallow water." },
  { name: "Pacific Halibut", slug: "pacific-halibut", scientificName: "Hippoglossus stenolepis", category: "flatfish", aliases: ["Halibut", "Hali"], description: "The largest flatfish in the Pacific, capable of exceeding 400 pounds. Pacific Halibut are found from California to Alaska and are one of the most highly valued food fish on the West Coast. They are targeted with heavy tackle on the ocean floor." },
  { name: "California Halibut", slug: "california-halibut", scientificName: "Paralichthys californicus", category: "flatfish", aliases: ["Cali Halibut", "California Flattie"], description: "A popular flatfish found from Washington to Baja California. California Halibut are aggressive predators found in sandy bays and along the coast. They typically range from 5 to 30 pounds and are prized for their excellent flavor." },

  // ==================== SHARKS ====================
  { name: "Blacktip Shark", slug: "blacktip-shark", scientificName: "Carcharhinus limbatus", category: "sharks", aliases: ["Blacktip", "Spinner Blacktip"], description: "One of the most commonly encountered sharks along the Atlantic and Gulf coasts. Blacktip Sharks are known for their spectacular spinning leaps when hooked. They are found nearshore, around inlets, and along beaches, and are popular targets for both surf and boat anglers." },
  { name: "Spinner Shark", slug: "spinner-shark", scientificName: "Carcharhinus brevipinna", category: "sharks", aliases: ["Spinner", "Large Blacktip Shark"], description: "A fast, acrobatic shark known for spinning through the air while feeding. Spinner Sharks are found along the Atlantic and Gulf coasts and are often confused with Blacktip Sharks. They provide exciting fights with multiple aerial displays." },
  { name: "Bull Shark", slug: "bull-shark", scientificName: "Carcharhinus leucas", category: "sharks", aliases: ["Bull", "Zambezi Shark"], description: "One of the most powerful and aggressive shark species found in both salt and fresh water. Bull Sharks inhabit coastal waters, bays, and even rivers along the Atlantic and Gulf coasts. They provide brutal, close-quarters fights on heavy tackle." },
  { name: "Hammerhead Shark", slug: "hammerhead-shark", scientificName: "Sphyrna spp.", category: "sharks", aliases: ["Great Hammerhead", "Scalloped Hammerhead", "Hammerhead"], description: "Among the most recognizable sharks in the ocean, identified by their distinctive flattened head. Several species of Hammerhead are found along US coasts, with the Great Hammerhead being the largest at over 1,000 pounds. They are powerful fighters and impressive catch-and-release targets." },
  { name: "Mako Shark", slug: "mako-shark", scientificName: "Isurus oxyrinchus", category: "sharks", aliases: ["Shortfin Mako", "Bonito Shark", "Blue Pointer"], description: "The fastest shark in the ocean, capable of speeds over 45 mph. Mako Sharks are found in open ocean waters and are considered one of the premier big-game sharks. They are renowned for their spectacular leaps and powerful runs, and their flesh is excellent for grilling." },
  { name: "Thresher Shark", slug: "thresher-shark", scientificName: "Alopias vulpinus", category: "sharks", aliases: ["Common Thresher", "Fox Shark"], description: "A spectacular shark identified by its enormously long upper tail lobe, which can be as long as its body. Thresher Sharks use their tail to stun prey and are found in both Atlantic and Pacific waters. They are powerful fighters and highly prized by sport fishermen." },
  { name: "Tiger Shark", slug: "tiger-shark", scientificName: "Galeocerdo cuvier", category: "sharks", aliases: ["Tiger"], description: "One of the largest and most powerful sharks in the ocean, capable of exceeding 1,500 pounds. Tiger Sharks are named for the dark vertical bars on juvenile fish and are found in warm coastal waters worldwide. They are impressive catch-and-release targets that provide epic battles." },
  { name: "Lemon Shark", slug: "lemon-shark", scientificName: "Negaprion brevirostris", category: "sharks", aliases: ["Lemon"], description: "A large, stocky shark found in warm, shallow waters of the Atlantic and Gulf coasts. Lemon Sharks are identified by their yellowish-brown coloring and are commonly found near mangroves, docks, and sandbars. They are popular catch-and-release targets in the Florida Keys." },
  { name: "Sandbar Shark", slug: "sandbar-shark", scientificName: "Carcharhinus plumbeus", category: "sharks", aliases: ["Brown Shark", "Thickskin Shark"], description: "One of the most common large coastal sharks along the eastern US. Sandbar Sharks are identified by their tall first dorsal fin and heavy, stocky build. They are frequently caught in bays and near beaches, especially in the mid-Atlantic." },

  // ==================== DOLPHINFISH ====================
  { name: "Mahi-Mahi", slug: "mahi-mahi", scientificName: "Coryphaena hippurus", category: "dolphinfish", aliases: ["Dolphin", "Dorado", "Dolphinfish", "Common Dolphinfish"], description: "One of the most colorful and exciting game fish in the ocean. Mahi-Mahi are found in warm waters worldwide and are known for their brilliant blue, green, and gold coloring, spectacular aerial displays, and fast growth rates. They are outstanding table fare and one of the most popular offshore targets." },

  // ==================== COBIA ====================
  { name: "Cobia", slug: "cobia", scientificName: "Rachycentron canadum", category: "cobia", aliases: ["Lemonfish", "Ling", "Black Kingfish", "Crabeater", "Black Salmon"], description: "A large, powerful fish found in warm waters of the Atlantic, Gulf, and Caribbean. Cobia are curious fish often seen following rays, turtles, and boats. They are one of the most highly prized game fish for their incredible fight and outstanding table quality. Fish regularly exceed 50 pounds." },

  // ==================== BASS & BLUEFISH ====================
  { name: "Striped Bass", slug: "striped-bass", scientificName: "Morone saxatilis", category: "bass-bluefish", aliases: ["Striper", "Rockfish", "Linesider", "Rock"], description: "The most iconic game fish of the Northeast Atlantic coast. Striped Bass migrate from the Carolinas to Maine and are found in bays, rivers, and along the surf. They are powerful fighters that can exceed 60 pounds and are equally revered by surf casters, boat anglers, and fly fishermen." },
  { name: "Bluefish", slug: "bluefish", scientificName: "Pomatomus saltatrix", category: "bass-bluefish", aliases: ["Blue", "Chopper", "Tailor", "Snapper Blue", "Gator Blue"], description: "One of the most aggressive and abundant game fish along the Atlantic coast. Bluefish travel in large schools and are voracious feeders known for their razor-sharp teeth and violent strikes. They are found from Maine to Florida and provide exciting action on light tackle." },
  { name: "Black Sea Bass", slug: "black-sea-bass", scientificName: "Centropristis striata", category: "bass-bluefish", aliases: ["Sea Bass", "Humpback", "Black Bass", "Blackfish"], description: "A popular bottom fish found from Maine to Florida, especially abundant in the mid-Atlantic. Black Sea Bass are typically found near structure, wrecks, and rocky bottom. They are aggressive biters and excellent eating with firm, white, mildly sweet flesh." },

  // ==================== COD & POLLOCK ====================
  { name: "Atlantic Cod", slug: "atlantic-cod", scientificName: "Gadus morhua", category: "cod-pollock", aliases: ["Cod", "Codfish", "Scrod"], description: "One of the most historically important fish in North America. Atlantic Cod are found in cold waters from Cape Hatteras to Canada and are a staple of party boat fishing in New England. They are bottom feeders found near wrecks and rocky substrate. 'Scrod' refers to small cod." },
  { name: "Haddock", slug: "haddock", scientificName: "Melanogrammus aeglefinus", category: "cod-pollock", aliases: ["Scrod Haddock"], description: "A popular cold-water bottom fish found in the Gulf of Maine and Georges Bank. Haddock are closely related to cod but are identified by a dark lateral line and a distinctive dark spot above the pectoral fin. They are prized for their delicate, slightly sweet flavor." },
  { name: "Pollock", slug: "pollock", scientificName: "Pollachius virens", category: "cod-pollock", aliases: ["Boston Bluefish", "Green Cod", "Coalfish"], description: "A cold-water species found throughout the Northeast Atlantic. Pollock are more active swimmers than cod and haddock and are often found higher in the water column near wrecks and structure. They provide good sport on light tackle and are excellent eating." },
  { name: "Red Hake", slug: "red-hake", scientificName: "Urophycis chuss", category: "cod-pollock", aliases: ["Squirrel Hake", "Ling"], description: "A bottom-dwelling fish found in the Northeast Atlantic from the Chesapeake Bay to Canada. Red Hake are typically caught while bottom fishing for cod and haddock. They are good eating when prepared fresh." },
  { name: "White Hake", slug: "white-hake", scientificName: "Urophycis tenuis", category: "cod-pollock", aliases: ["Mud Hake", "Boston Hake"], description: "A large hake species found in deeper waters of the Northeast Atlantic. White Hake can reach 50 pounds and are commonly caught on deep-water wrecks. They have soft, white flesh that is mild and pleasant when cooked fresh." },

  // ==================== PORGIES & WRASSES ====================
  { name: "Porgy", slug: "porgy", scientificName: "Stenotomus chrysops", category: "porgies-wrasses", aliases: ["Scup", "Northern Porgy", "Scuppaug"], description: "One of the most popular pan fish in the Northeast. Porgies are found near structure, wrecks, and hard bottom from the Chesapeake Bay to New England. They are aggressive biters that provide fun light-tackle action and are excellent pan-fried or grilled." },
  { name: "Red Porgy", slug: "red-porgy", scientificName: "Pagrus pagrus", category: "porgies-wrasses", aliases: ["Silver Snapper", "Pink Porgy"], description: "A deepwater porgy found over hard bottom and reef structure in the South Atlantic and Gulf. Red Porgy are identified by their pinkish-red coloring and are commonly caught while targeting snapper and grouper. They are excellent eating." },
  { name: "Jolthead Porgy", slug: "jolthead-porgy", scientificName: "Calamus bajonado", category: "porgies-wrasses", aliases: ["Jolthead"], description: "The largest porgy species in the western Atlantic, capable of reaching 25 pounds. Jolthead Porgies are found on coral reefs and hard bottom in Florida and the Caribbean. They have powerful jaws for crushing crustaceans." },
  { name: "Tautog", slug: "tautog", scientificName: "Tautoga onitis", category: "porgies-wrasses", aliases: ["Blackfish", "Tog", "White Chin"], description: "A tough, structure-oriented fish found from Nova Scotia to the Carolinas. Tautog are incredibly powerful for their size and are known for diving into rocks and wrecks when hooked. They are highly prized for their firm, white, sweet-flavored flesh and are a fall favorite in the Northeast." },
  { name: "Hogfish", slug: "hogfish", scientificName: "Lachnolaimus maximus", category: "porgies-wrasses", aliases: ["Hog Snapper", "Hoggie", "Hog Fish"], description: "One of the most prized reef fish in Florida and the Caribbean. Hogfish are actually wrasses but are commonly associated with snapper and grouper. They are known for their distinctive pig-like snout and are widely regarded as one of the best-tasting fish in the sea." },
  { name: "California Sheephead", slug: "california-sheephead", scientificName: "Semicossyphus pulcher", category: "porgies-wrasses", aliases: ["Sheephead", "Sheepie", "Goat"], description: "A large, colorful wrasse found along the Southern California and Channel Islands coast. California Sheephead have powerful teeth for crushing sea urchins and shellfish. Males are black with a red midsection and white chin, while females are pinkish-red." },

  // ==================== OTHER (MISC) ====================
  { name: "Tripletail", slug: "tripletail", scientificName: "Lobotes surinamensis", category: "other-species", aliases: ["Blackfish", "Buoy Fish", "Floating Flounder"], description: "A unique fish known for floating on its side near buoys, crab traps, and debris. Tripletail are found in warm waters of the Atlantic, Gulf, and Caribbean. Their three rounded fins give them a distinctive silhouette. They are outstanding table fare with firm, white, sweet-flavored flesh." },

  // ==================== ROCKFISH & LINGCOD ====================
  { name: "Vermilion Rockfish", slug: "vermilion-rockfish", scientificName: "Sebastes miniatus", category: "rockfish-lingcod", aliases: ["Red Snapper", "Red Rock Cod", "Reds"], description: "One of the most popular rockfish species along the Pacific coast, often called 'Red Snapper' in California (not related to the Atlantic species). Vermilion Rockfish are found near rocky reefs and structure from British Columbia to Baja California." },
  { name: "Copper Rockfish", slug: "copper-rockfish", scientificName: "Sebastes caurinus", category: "rockfish-lingcod", aliases: ["Copper", "Whitebelly Rockfish"], description: "A medium-sized rockfish found along the Pacific coast from Alaska to Baja California. Copper Rockfish are identified by their copper-brown coloring with patches of pink and white. They are excellent eating and a popular target for nearshore anglers." },
  { name: "Blue Rockfish", slug: "blue-rockfish", scientificName: "Sebastes mystinus", category: "rockfish-lingcod", aliases: ["Blue Bass", "Priestfish"], description: "One of the most commonly caught rockfish along the central and northern California coast. Blue Rockfish are found near rocky reefs and kelp beds in relatively shallow water. They are good eating and readily take both bait and artificial lures." },
  { name: "Canary Rockfish", slug: "canary-rockfish", scientificName: "Sebastes pinniger", category: "rockfish-lingcod", aliases: ["Orange Rockfish", "Fantail"], description: "A brightly colored rockfish found from Alaska to Baja California. Canary Rockfish are identified by their orange-yellow coloring and are typically found in deeper water over rocky bottom. They are excellent table fare." },
  { name: "Bocaccio", slug: "bocaccio", scientificName: "Sebastes paucispinis", category: "rockfish-lingcod", aliases: ["Salmon Grouper", "Rock Salmon"], description: "One of the largest rockfish species on the Pacific coast, capable of reaching 20 pounds. Bocaccio are found over rocky bottom and near structure from British Columbia to Baja California. They have large mouths and are aggressive predators." },
  { name: "Yelloweye Rockfish", slug: "yelloweye-rockfish", scientificName: "Sebastes ruberrimus", category: "rockfish-lingcod", aliases: ["Red Snapper", "Rasphead", "Turkey Red"], description: "The largest rockfish species in the Pacific, capable of reaching 40 pounds and living over 100 years. Yelloweye Rockfish are bright orange-red with distinctive yellow eyes. They are found in deep rocky habitat and are highly prized for their excellent flavor." },
  { name: "Black Rockfish", slug: "black-rockfish", scientificName: "Sebastes melanops", category: "rockfish-lingcod", aliases: ["Black Bass", "Black Snapper"], description: "One of the most common rockfish in the Pacific Northwest. Black Rockfish are found near rocky reefs and kelp beds and are popular targets for both boat and shore anglers. They are good fighting fish and excellent eating." },
  { name: "Quillback Rockfish", slug: "quillback-rockfish", scientificName: "Sebastes maliger", category: "rockfish-lingcod", aliases: ["Quillback", "Orange-Spotted Rockfish"], description: "A distinctive rockfish identified by its high, sharp dorsal spines and mottled brown-orange coloring. Quillback Rockfish are found from Alaska to central California near rocky structure and are excellent table fare." },
  { name: "Olive Rockfish", slug: "olive-rockfish", scientificName: "Sebastes serranoides", category: "rockfish-lingcod", aliases: ["Olive Bass", "Johnny Bass"], description: "A common rockfish found along the California coast near kelp beds and rocky reefs. Olive Rockfish are active swimmers often found higher in the water column compared to other rockfish species. They provide good sport on light tackle." },
  { name: "China Rockfish", slug: "china-rockfish", scientificName: "Sebastes nebulosus", category: "rockfish-lingcod", aliases: ["Yellowstripe Rockfish"], description: "A striking rockfish identified by a bold yellow stripe running from the dorsal fin to the lateral line. China Rockfish are found in rocky crevices and caves from Alaska to southern California and are considered excellent eating." },
  { name: "Starry Rockfish", slug: "starry-rockfish", scientificName: "Sebastes constellatus", category: "rockfish-lingcod", aliases: ["Spotted Corsair"], description: "A colorful deepwater rockfish found along the southern California coast. Starry Rockfish are orange-red with numerous white dots that give them their name. They are prized for their excellent flavor and firm texture." },
  { name: "Gopher Rockfish", slug: "gopher-rockfish", scientificName: "Sebastes carnatus", category: "rockfish-lingcod", aliases: ["Gopher Cod"], description: "A small but popular rockfish found in nearshore rocky habitats along the central California coast. Gopher Rockfish are identified by their mottled brown and pink coloring and are commonly caught from kayaks and small boats near the kelp line." },

  // ==================== (REDISTRIBUTED - formerly Pacific Game Fish) ====================
  { name: "California Yellowtail", slug: "california-yellowtail", scientificName: "Seriola dorsalis", category: "jacks-pompanos", aliases: ["Yellowtail", "Yellow", "Mossback", "Homeguard"], description: "One of the most popular game fish along the Southern California coast. Yellowtail are powerful, fast-running jacks found near kelp beds, islands, and offshore banks. They provide spectacular fights and are outstanding table fare. Trophy fish exceed 40 pounds." },
  { name: "White Seabass", slug: "white-seabass", scientificName: "Atractoscion nobilis", category: "drums-croakers", aliases: ["White Sea Bass", "Weakfish", "King Croaker"], description: "The largest member of the croaker family on the Pacific coast, capable of exceeding 80 pounds. White Seabass are found near kelp beds and rocky structure along the California coast. They are challenging to find and highly prized for both their fight and outstanding table quality." },
  { name: "Lingcod", slug: "lingcod", scientificName: "Ophiodon elongatus", category: "rockfish-lingcod", aliases: ["Ling", "Buckethead"], description: "A large, aggressive predator found from Alaska to Baja California. Lingcod are voracious feeders with enormous mouths and sharp teeth. They are found near rocky bottom and structure and can exceed 60 pounds. Their flesh sometimes has a bluish-green tint that turns white when cooked and is excellent eating." },
  { name: "Barracuda", slug: "barracuda", scientificName: "Sphyraena spp.", category: "other-species", aliases: ["California Barracuda", "Great Barracuda", "Pacific Barracuda"], description: "Fast, aggressive predators found in both the Pacific (California Barracuda) and Atlantic (Great Barracuda). A common catch on party boats, known for explosive strikes and razor-sharp teeth." },
  { name: "Pacific Bonito", slug: "pacific-bonito", scientificName: "Sarda chiliensis", category: "mackerels", aliases: ["Bonito", "Boneheads"], description: "A fast-swimming member of the mackerel family found along the Pacific coast. Pacific Bonito are popular sport fish that travel in large schools and are aggressive surface feeders. They are excellent smoked and are premium live bait for larger game fish." },
  { name: "Kelp Bass", slug: "kelp-bass", scientificName: "Paralabrax clathratus", category: "bass-bluefish", aliases: ["Calico Bass", "Calico", "Bull Bass"], description: "The most popular nearshore game fish in Southern California. Kelp Bass are found around kelp beds, rocky reefs, and structure throughout the Southern California Bight. They are scrappy fighters on light tackle and excellent table fare, with a minimum size limit that makes them a fun challenge." },
  { name: "Barred Sand Bass", slug: "barred-sand-bass", scientificName: "Paralabrax nebulifer", category: "bass-bluefish", aliases: ["Sand Bass", "Sandies"], description: "A popular nearshore game fish found along the Southern California coast. Barred Sand Bass are typically found near sandy bottom and structure and are known for forming large spawning aggregations in summer. They are good fighting fish and excellent eating." },
  { name: "Cabezon", slug: "cabezon", scientificName: "Scorpaenichthys marmoratus", category: "rockfish-lingcod", aliases: ["Cab", "Bullhead", "Marbled Sculpin"], description: "The largest sculpin species in North America, found along the Pacific coast from Alaska to Baja California. Cabezon are bottom dwellers found in rocky intertidal and subtidal zones. Their flesh is excellent eating, but their roe is toxic and must not be consumed." },
  { name: "Pacific Mackerel", slug: "pacific-mackerel", scientificName: "Scomber japonicus", category: "mackerels", aliases: ["Chub Mackerel", "Pacific Jack Mackerel", "Blue Mackerel", "Greenback"], description: "A small, abundant pelagic fish found along the Pacific coast. Pacific Mackerel are popular as both sport fish and bait. They are fast swimmers found in large schools near the surface and are commonly caught from piers, jetties, and party boats." },

  // ==================== TRIGGERFISH ====================
  { name: "Gray Triggerfish", slug: "gray-triggerfish", scientificName: "Balistes capriscus", category: "triggerfish", aliases: ["Triggerfish", "Trigger", "Leatherjacket"], description: "A popular reef fish found throughout the Gulf of Mexico and South Atlantic. Gray Triggerfish are known for their tough skin, strong teeth, and ability to steal bait. They are challenging to hook but are outstanding table fare with firm, sweet, white flesh." },
  { name: "Queen Triggerfish", slug: "queen-triggerfish", scientificName: "Balistes vetula", category: "triggerfish", aliases: ["Queen Trigger", "Ol' Wife"], description: "A strikingly colorful triggerfish found on coral reefs in South Florida and the Caribbean. Queen Triggerfish have brilliant blue, green, and yellow markings and are excellent eating, though they are less commonly targeted than Gray Triggerfish." },
  { name: "Ocean Triggerfish", slug: "ocean-triggerfish", scientificName: "Canthidermis sufflamen", category: "triggerfish", aliases: ["Ocean Tally", "Turbot"], description: "A pelagic triggerfish found near floating debris and structure in offshore waters. Ocean Triggerfish are larger than most triggerfish species and are commonly caught while trolling or chunking offshore." },
  { name: "Golden Tilefish", slug: "golden-tilefish", scientificName: "Lopholatilus chamaeleonticeps", category: "tilefish", aliases: ["Tilefish", "Great Northern Tilefish", "Golden Tile"], description: "A spectacular deepwater fish found at depths of 600 to 1,200 feet along the continental shelf edge. Golden Tilefish are brilliantly colored with blue, green, gold, and pink markings. They are one of the finest-eating fish in the ocean and are targeted on deep-drop trips." },
  { name: "Blueline Tilefish", slug: "blueline-tilefish", scientificName: "Caulolatilus microps", category: "tilefish", aliases: ["Gray Tilefish", "Blueline Tile"], description: "A deepwater bottom fish found at depths of 200 to 800 feet in the Gulf and South Atlantic. Blueline Tilefish are identified by a distinctive blue-gold line from snout to eye. They are excellent eating with firm, white, sweet-flavored flesh." },

  // ==================== TILEFISH ====================
  // (Golden Tilefish and Blueline Tilefish are above, after Triggerfish)
];

// ============================================================
// Seed Function
// ============================================================

async function seedSpecies() {
  console.log("Starting species seed...\n");

  // 1. Upsert categories
  console.log("Seeding categories...");
  const categoryMap = new Map<string, number>();

  for (const cat of CATEGORIES) {
    const existing = await db
      .select({ id: speciesCategories.id })
      .from(speciesCategories)
      .where(eq(speciesCategories.slug, cat.slug))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(speciesCategories)
        .set({ name: cat.name, sortOrder: cat.sortOrder, description: cat.description })
        .where(eq(speciesCategories.id, existing[0].id));
      categoryMap.set(cat.slug, existing[0].id);
    } else {
      const [created] = await db
        .insert(speciesCategories)
        .values(cat)
        .returning({ id: speciesCategories.id });
      categoryMap.set(cat.slug, created.id);
    }
  }
  console.log(`  ${CATEGORIES.length} categories processed\n`);

  // 2. Upsert species
  console.log("Seeding species...");
  let created = 0;
  let updated = 0;
  let aliasCount = 0;

  for (const sp of SPECIES_DATA) {
    const catId = categoryMap.get(sp.category);
    if (!catId) {
      console.warn(`  WARNING: No category found for "${sp.category}" (species: ${sp.name})`);
      continue;
    }

    const existing = await db
      .select({ id: species.id })
      .from(species)
      .where(eq(species.slug, sp.slug))
      .limit(1);

    let speciesId: number;

    if (existing.length > 0) {
      speciesId = existing[0].id;
      await db
        .update(species)
        .set({
          name: sp.name,
          categoryId: catId,
          scientificName: sp.scientificName,
          description: sp.description,
          sortOrder: SPECIES_DATA.indexOf(sp),
        })
        .where(eq(species.id, speciesId));
      updated++;
    } else {
      const [newSpecies] = await db
        .insert(species)
        .values({
          name: sp.name,
          slug: sp.slug,
          sortOrder: SPECIES_DATA.indexOf(sp),
          categoryId: catId,
          scientificName: sp.scientificName,
          description: sp.description,
        })
        .returning({ id: species.id });
      speciesId = newSpecies.id;
      created++;
    }

    // 3. Sync aliases: delete existing, re-insert
    await db.delete(speciesAliases).where(eq(speciesAliases.speciesId, speciesId));

    if (sp.aliases.length > 0) {
      await db.insert(speciesAliases).values(
        sp.aliases.map((alias) => ({
          speciesId,
          name: alias,
          nameLower: alias.toLowerCase(),
        }))
      );
      aliasCount += sp.aliases.length;
    }
  }

  console.log(`  ${created} created, ${updated} updated, ${aliasCount} aliases set\n`);

  // 4. Report orphaned species (in DB but not in seed)
  const allDbSpecies = await db.select({ id: species.id, name: species.name, slug: species.slug }).from(species);
  const seedSlugs = new Set(SPECIES_DATA.map((s) => s.slug));
  const orphaned = allDbSpecies.filter((s) => !seedSlugs.has(s.slug));

  if (orphaned.length > 0) {
    console.log("Orphaned species (in DB but not in seed data):");
    for (const o of orphaned) {
      // Check if any boats reference this species
      const [ref] = await db
        .select({ count: sql<number>`count(*)` })
        .from(boatSpecies)
        .where(eq(boatSpecies.speciesId, o.id));
      const boatCount = Number(ref?.count ?? 0);
      console.log(`  - "${o.name}" (slug: ${o.slug}) - ${boatCount} boats linked`);
    }
    console.log("\n  These species were NOT deleted. Review and remove manually if not needed.");
  }

  console.log("\nDone! Species seed complete.");
}

seedSpecies()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
