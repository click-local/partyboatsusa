import type { ReactNode } from "react";

export interface StateSEOContent {
  /** Sections rendered above the "Fishing Ports" section */
  sections: {
    heading: string;
    body: ReactNode;
  }[];
}

/**
 * Hand-written, high-value SEO content for each state page.
 * Keyed by state slug.
 */
export const stateSEOContent: Record<string, StateSEOContent> = {
  florida: {
    sections: [
      {
        heading: "Why Florida Is the Party Boat Fishing Capital of America",
        body: (
          <>
            <p>
              Florida offers more party boat fishing opportunities than any other
              state in the country. With over 1,300 miles of coastline, warm
              waters year-round, and some of the most productive fishing grounds
              in the Atlantic Ocean and Gulf of Mexico, Florida is where anglers
              of every skill level come to catch fish. Whether you are a
              first-timer looking for a fun day on the water or a seasoned angler
              chasing trophy species, Florida{"'"}s party boats deliver an
              experience that is hard to match anywhere else.
            </p>
            <p>
              Party boats, also called head boats or open boats, are large
              vessels that sell tickets per person rather than requiring a private
              charter. That makes them one of the most affordable ways to get
              offshore and fish productive reefs, wrecks, and ledges that are
              unreachable from shore. Most Florida party boats carry between 20
              and 80 passengers, provide all rods, reels, bait, and tackle, and
              include a fishing license so you can show up with nothing but
              sunscreen and a cooler.
            </p>
          </>
        ),
      },
      {
        heading: "Florida's Top Party Boat Fishing Regions",
        body: (
          <>
            <p>
              <strong>The Florida Keys and Key West</strong> sit at the southern
              tip of the state where the Atlantic meets the Gulf of Mexico.
              Crystal-clear waters, coral reefs, and deep channels close to shore
              make Key West one of the most popular party boat ports in the
              country. Anglers here target Yellowtail Snapper, Mutton Snapper,
              Grouper, and Mahi-Mahi on trips that range from half-day reef
              excursions to full-day offshore runs.
            </p>
            <p>
              <strong>The Florida Panhandle and Emerald Coast</strong> stretches
              from Pensacola to Panama City Beach and is home to Destin, widely
              known as the {"\""}World{"'"}s Luckiest Fishing Village.{"\""} The
              deep waters of the Gulf are loaded with Red Snapper, Greater
              Amberjack, Triggerfish, and Grouper. Destin and Panama City Beach
              party boats typically run half-day, three-quarter-day, and full-day
              trips to natural and artificial reefs within 10 to 40 miles of
              shore.
            </p>
            <p>
              <strong>Southwest Florida and the Gulf Coast</strong> ports like
              Naples and Marco Island offer party boat fishing over natural
              limestone ledges and wrecks in the Gulf. Red Grouper, Mangrove
              Snapper, Cobia, and King Mackerel are the primary catches here.
              The water is generally calmer than the Atlantic side, making it a
              good choice for families and passengers who are concerned about
              seasickness.
            </p>
            <p>
              <strong>The Atlantic Coast</strong> from Fort Pierce and Jensen
              Beach up through Cape Canaveral and Pompano Beach puts anglers over
              the Gulf Stream, one of the most productive fishing currents in the
              world. Party boats on the Atlantic side target a mix of bottom
              species like Grouper and Snapper along with pelagics like
              Mahi-Mahi, Blackfin Tuna, and King Mackerel. The proximity of deep
              water to shore means shorter runs to the fishing grounds.
            </p>
          </>
        ),
      },
      {
        heading: "What Species Can You Catch on a Florida Party Boat?",
        body: (
          <>
            <p>
              Florida{"'"}s party boats consistently produce a wide variety of
              species throughout the year. The most commonly caught fish across
              the state include Red Grouper, Mangrove Snapper, Red Snapper,
              Greater Amberjack, King Mackerel, Cobia, Gray Triggerfish, and
              Yellowtail Snapper. On deeper trips, you may also encounter
              Mahi-Mahi, Blackfin Tuna, Scamp Grouper, Vermilion Snapper, and
              Golden Tilefish.
            </p>
            <p>
              Fishing seasons vary by species and region. Red Snapper season in
              the Gulf of Mexico typically runs during the summer months and is
              one of the most anticipated openings of the year. Grouper season
              generally runs from January through December in federal waters,
              though specific regulations change by species and area. King
              Mackerel run strong in the fall and winter months. Mahi-Mahi are
              most abundant from spring through early fall along the Atlantic
              coast.
            </p>
            <p>
              One of the biggest advantages of party boat fishing in Florida is
              that there is always something in season. Even during the cooler
              winter months, bottom fishing remains productive for Grouper,
              Snapper, and Triggerfish. This year-round availability is a major
              reason Florida attracts more fishing tourists than any other state.
            </p>
          </>
        ),
      },
      {
        heading: "What to Expect on a Florida Party Boat Trip",
        body: (
          <>
            <p>
              A typical party boat trip in Florida lasts between 4 and 12 hours
              depending on the type of trip. Half-day trips are the most popular
              option and usually run 4 to 5 hours, spending most of that time
              anchored over reefs or wrecks. Three-quarter-day and full-day trips
              travel further offshore to deeper waters where you can target
              larger species.
            </p>
            <p>
              Most boats include everything you need: rods, reels, terminal
              tackle, bait, and a Florida fishing license. Crew members are on
              hand to bait hooks, untangle lines, identify fish, and help you
              land your catch. Many boats also offer fish cleaning services at
              the dock so you can take home fresh fillets. If you want to bring
              your own gear, most captains welcome that as well.
            </p>
            <p>
              Pricing for Florida party boat trips generally starts around $50
              per adult for a half-day trip and goes up from there for longer
              trips or specialty excursions. Children{"'"}s rates are usually
              discounted. Tips for the crew are customary and not included in the
              ticket price. Most boats have a snack bar or allow you to bring
              your own food and drinks, though glass containers are usually
              prohibited.
            </p>
          </>
        ),
      },
      {
        heading: "Tips for Booking a Party Boat in Florida",
        body: (
          <>
            <p>
              Florida party boats run year-round, but availability can be limited
              during peak season from March through September. Booking in advance
              is recommended, especially for weekend trips and during holidays.
              Many boats offer online reservations, and some sell out days or
              even weeks ahead during Red Snapper season and spring break.
            </p>
            <p>
              If you are prone to motion sickness, consider booking a half-day
              trip first before committing to a longer offshore run. Taking
              seasickness medication 30 to 60 minutes before departure is a
              common precaution. Gulf-side trips out of ports like Naples, Marco
              Island, and Destin tend to have calmer seas than Atlantic-side
              departures, particularly during the summer months.
            </p>
            <p>
              Bring sun protection, polarized sunglasses, a hat, and comfortable
              shoes with non-slip soles. Most boats provide shade but the
              Florida sun is intense, especially during the summer. A light rain
              jacket can be useful since afternoon showers are common from June
              through September.
            </p>
          </>
        ),
      },
    ],
  },

  alabama: {
    sections: [
      {
        heading: "Alabama's Gulf Coast: A Red Snapper Hotspot",
        body: (
          <>
            <p>
              Alabama may have the shortest coastline of any Gulf state, but
              that narrow strip of coast punches well above its weight when it
              comes to party boat fishing. The waters off Orange Beach, Gulf
              Shores, and Dauphin Island sit directly over one of the densest
              concentrations of artificial reefs in the world. Alabama has
              deployed more than 20,000 artificial reef structures in the Gulf of
              Mexico, creating an underwater habitat network that attracts massive
              populations of Red Snapper, Triggerfish, Greater Amberjack, and
              other reef species.
            </p>
            <p>
              Party boats departing from Alabama typically head south into the
              Gulf where depths drop from 60 to over 200 feet within a
              relatively short run. That means less time traveling and more time
              fishing. For anglers visiting the Alabama Gulf Coast, a party boat
              trip is one of the best values available for getting offshore
              without booking a private charter.
            </p>
          </>
        ),
      },
      {
        heading: "Alabama's Artificial Reef Program and Why It Matters",
        body: (
          <>
            <p>
              Alabama{"'"}s artificial reef program is the largest in the country
              and a major reason the state{"'"}s offshore fishing is so
              productive. Old ships, concrete culverts, decommissioned oil
              platforms, and purpose-built reef pyramids have been sunk across
              more than 1,200 square miles of permitted reef zones. These
              structures attract baitfish, which in turn draw in predators like
              Snapper, Grouper, and Amberjack.
            </p>
            <p>
              For party boat passengers, this means the fishing grounds are
              loaded with structure and marine life. Captains have hundreds of
              proven reef sites to choose from, and the competition between
              species on these reefs keeps the action steady. It is common to
              catch multiple species on a single drop, with Red Snapper, Vermilion
              Snapper, and White Snapper all competing for your bait.
            </p>
          </>
        ),
      },
      {
        heading: "Target Species Off the Alabama Coast",
        body: (
          <>
            <p>
              Red Snapper is the headline species for Alabama party boats and
              the fish that draws anglers from across the Southeast. Alabama{"'"}s
              Red Snapper season in state waters has expanded significantly in
              recent years thanks to healthy fish populations, giving anglers
              more days to target these hard-fighting reef fish. Federal season
              dates are set annually, usually opening in June, and party boats
              fill up fast during those weekends.
            </p>
            <p>
              Beyond Red Snapper, Alabama party boats regularly produce
              Triggerfish, Greater Amberjack, Vermilion Snapper (locally called
              Beeliners), Red Grouper, Scamp, King Mackerel, and Cobia. During
              the fall, large schools of King Mackerel migrate through the area,
              and some boats switch to trolling runs to target them. Lane
              Snapper, Porgy, and White Snapper round out the bottom fishing
              catches throughout the year.
            </p>
          </>
        ),
      },
      {
        heading: "Planning Your Alabama Party Boat Trip",
        body: (
          <>
            <p>
              Most Alabama party boats operate out of marinas in Orange Beach
              and Gulf Shores, with easy access from the Foley Beach Express and
              the Gulf State Park area. Half-day trips typically run 5 to 6
              hours and focus on nearshore reefs in 60 to 100 feet of water.
              Full-day trips push further offshore to deeper structure where you
              can expect to find larger fish and a wider variety of species.
            </p>
            <p>
              The summer months bring the warmest water temperatures and the
              calmest seas, making it the most popular time to fish. Spring and
              fall offer excellent fishing with fewer crowds, and water
              temperatures remain comfortable into November. Winter trips run
              less frequently but can produce outstanding bottom fishing for
              those willing to brave cooler mornings on the water.
            </p>
            <p>
              All party boats provide rods, reels, tackle, and bait. An Alabama
              saltwater fishing license is included with your ticket. Crew
              members handle the rigging and will help beginners with every step
              from baiting to landing fish. Fish cleaning services are available
              at most docks for a small fee.
            </p>
          </>
        ),
      },
    ],
  },

  alaska: {
    sections: [
      {
        heading: "Party Boat Fishing in Alaska: A Bucket-List Experience",
        body: (
          <>
            <p>
              Alaska offers a fishing experience unlike anything available in
              the lower 48 states. The cold, nutrient-rich waters of the North
              Pacific produce some of the largest Halibut and most abundant
              Salmon runs on the planet. While the term {"\""}party boat{"\""} is
              more commonly associated with warm-water destinations, Alaska has
              its own version: large multi-passenger vessels that take groups of
              anglers out to fish the productive waters of places like
              Resurrection Bay, Kachemak Bay, Prince William Sound, and the
              Kenai Peninsula.
            </p>
            <p>
              These shared charter trips sell individual tickets and provide all
              the gear, bait, and expertise needed for a successful day. For
              visitors who want to experience Alaska{"'"}s legendary fishing
              without the expense of booking an entire private charter, these
              group trips are the perfect option.
            </p>
          </>
        ),
      },
      {
        heading: "Halibut Fishing: The Main Event",
        body: (
          <>
            <p>
              Pacific Halibut is the premier target for Alaska{"'"}s party boat
              fleet. These giant flatfish live on the ocean floor in depths
              ranging from 50 to over 300 feet and can grow to over 300 pounds,
              though fish in the 20 to 80 pound range are far more common on
              group trips. Reeling a Halibut up from the bottom is a full-body
              workout that leaves a lasting impression on first-time anglers.
            </p>
            <p>
              Halibut season in Alaska generally runs from late April or early
              May through September, with peak action in June and July. The
              International Pacific Halibut Commission sets annual catch limits,
              and regulations on bag limits and size slots can change from year
              to year. Party boat crews stay current on all regulations and will
              measure and release fish that fall outside the legal harvest
              window.
            </p>
          </>
        ),
      },
      {
        heading: "Salmon, Lingcod, and Rockfish",
        body: (
          <>
            <p>
              Many Alaska party boats offer combination trips that target
              Halibut alongside other species. Silver Salmon (Coho) runs from
              July through September provide exciting topwater action, with fish
              in the 8 to 15 pound range that fight aggressively. Some trips
              also target Lingcod, a toothy bottom predator prized for its firm,
              white flesh, and various species of Rockfish including Yelloweye,
              Black Rockfish, and Quillback.
            </p>
            <p>
              King Salmon (Chinook) are the largest Pacific Salmon species and
              run primarily from May through July. While King Salmon fishing is
              more commonly done from smaller boats, some larger vessels in
              Southeast Alaska and the Kenai Peninsula area offer group trips
              during peak runs. Catching a 30-plus pound King Salmon on rod and
              reel is a highlight that many anglers travel thousands of miles to
              experience.
            </p>
          </>
        ),
      },
      {
        heading: "What Makes Alaska Different",
        body: (
          <>
            <p>
              Fishing in Alaska involves long summer days with up to 18 hours
              of daylight, dramatic mountain and glacier scenery visible from
              the fishing grounds, and regular wildlife sightings including
              Humpback Whales, Sea Otters, Bald Eagles, and occasionally Orca.
              The experience goes far beyond catching fish.
            </p>
            <p>
              Water temperatures are cold year-round, typically between 40 and
              55 degrees, so dressing in layers is essential. Most party boats
              provide rain gear or have heated cabins, but bringing warm,
              waterproof clothing is strongly recommended. Trips typically
              depart early in the morning and run 6 to 10 hours depending on
              the fishing location and conditions.
            </p>
            <p>
              Alaska party boat trips generally cost more than their
              counterparts in other states, reflecting the remote location and
              shorter season. Most operators offer vacuum-sealed fish processing
              and shipping services so you can take your catch home, even if
              you are flying.
            </p>
          </>
        ),
      },
    ],
  },

  california: {
    sections: [
      {
        heading: "California's Party Boat Tradition",
        body: (
          <>
            <p>
              California has one of the oldest and most established party boat
              fishing traditions in the United States. Known locally as
              {"\""}sportfishing landings,{"\""} California{"'"}s network of
              docks and landings stretches from San Diego to the Bay Area and
              has been running group fishing trips for over a century. The
              state{"'"}s party boat fleet is large, well-maintained, and serves
              every type of angler from weekend beginners to serious fishermen
              who ride the boats several times a month.
            </p>
            <p>
              The Pacific Ocean off California{"'"}s coast drops to deep water
              quickly, which means productive fishing grounds are often within
              a short boat ride from port. Rocky reefs, kelp forests, submarine
              canyons, and open-water pelagic zones all support different
              fisheries that keep California{"'"}s party boats busy throughout
              the year.
            </p>
          </>
        ),
      },
      {
        heading: "Southern California: The Heart of the Fleet",
        body: (
          <>
            <p>
              The majority of California{"'"}s party boat activity is
              concentrated in Southern California, with major landings in San
              Diego, Long Beach, Dana Point, Newport Beach, Oxnard, and Ventura.
              These ports launch boats that range from fast 65-foot aluminum
              vessels to 85-foot fiberglass cruisers built specifically for
              passenger fishing.
            </p>
            <p>
              During warm-water years, Southern California becomes a pelagic
              fishing hotspot with Yellowtail, Bluefin Tuna, Yellowfin Tuna,
              Dorado (Mahi-Mahi), and White Seabass all within range of the
              party boat fleet. Rockfish and Lingcod provide reliable bottom
              fishing year-round on rocky reefs from 100 to 400 feet deep.
              Calico Bass, Sand Bass, and Barracuda are popular inshore targets
              during the warmer months.
            </p>
            <p>
              Multi-day trips are a California specialty not found in most other
              states. These overnight and two-to-three-day trips travel to the
              offshore islands and banks, including San Clemente Island, Santa
              Catalina, the Coronado Islands, and Tanner Bank, where pelagic
              action can be exceptional.
            </p>
          </>
        ),
      },
      {
        heading: "Central and Northern California Fishing",
        body: (
          <>
            <p>
              Ports like Morro Bay, Monterey, Santa Cruz, Emeryville, and
              Bodega Bay serve anglers targeting a different mix of species.
              Rockfish and Lingcod dominate the catch along the Central Coast,
              with deep-water drops over underwater pinnacles producing fish
              well over 10 pounds. Pacific Halibut make seasonal appearances in
              Northern California, and Dungeness Crab trips round out the
              winter schedule for many boats.
            </p>
            <p>
              Salmon fishing is a major draw in Northern and Central California
              when seasons are open. Chinook Salmon trolling trips out of ports
              like Bodega Bay and Emeryville draw anglers from across the state.
              Salmon seasons in California are set annually based on population
              assessments and can vary significantly from year to year.
            </p>
          </>
        ),
      },
      {
        heading: "Booking California Party Boat Trips",
        body: (
          <>
            <p>
              California party boats run on a schedule posted by each landing,
              with trips departing as early as 4:00 AM for full-day offshore runs
              and as late as 9:00 PM for overnight trips. Half-day trips are the
              most popular option for casual anglers and typically run 5 to 6
              hours. Three-quarter-day trips extend to 8 or 9 hours and reach
              more distant fishing grounds.
            </p>
            <p>
              A California fishing license is required and not included in most
              boat fares, unlike party boats in many other states. Licenses can
              be purchased online through the California Department of Fish and
              Wildlife or at most landings. Rod rentals are available, but many
              regular California party boat anglers bring their own gear tailored
              to the specific fishery.
            </p>
            <p>
              Southern California waters are generally mild with minimal swell
              during summer and fall, making those months ideal for anglers
              concerned about comfort. Winter and spring bring more ocean swell
              and cooler air temperatures, but the fishing for Rockfish, Lingcod,
              and Sheephead remains strong.
            </p>
          </>
        ),
      },
    ],
  },

  connecticut: {
    sections: [
      {
        heading: "Party Boat Fishing on Long Island Sound",
        body: (
          <>
            <p>
              Connecticut sits along the northern shore of Long Island Sound,
              a body of water that serves as one of the most productive
              recreational fishing grounds in the Northeast. The Sound{"'"}s
              mix of shallow flats, deep channels, rocky structure, and tidal
              rips creates habitat for a diverse range of species that keep
              Connecticut{"'"}s party boats busy from spring through late fall.
            </p>
            <p>
              Party boat fishing has deep roots in Connecticut, with boats
              operating out of ports like Niantic, Waterford, Groton, and
              Clinton for decades. These boats provide an affordable and social
              way to access fishing grounds that are difficult to reach from
              shore or from small private boats without local knowledge.
            </p>
          </>
        ),
      },
      {
        heading: "Seasonal Fishing Calendar",
        body: (
          <>
            <p>
              Connecticut{"'"}s fishing follows a clear seasonal rhythm that
              gives each time of year its own character. Spring kicks off in
              April and May with Porgies (Scup) and Blackfish (Tautog) on
              rocky structure, followed by the arrival of Bluefish and Striped
              Bass as water temperatures climb into the 50s and 60s.
            </p>
            <p>
              Summer is the busiest season, with Fluke (Summer Flounder)
              becoming the top target from June through August. Fluke hold on
              sandy bottoms near structure and channel edges, and drift-fishing
              with bucktail jigs tipped with bait strips is the standard
              technique on party boats. Bluefish and Striped Bass also remain
              available through the summer months.
            </p>
            <p>
              Fall is widely considered the best time to fish Connecticut
              waters. Migrating Striped Bass push through the Sound in large
              numbers, Bluefish are at their heaviest, and Sea Bass season
              reopens with generous bag limits. Blackfish return to rocky reefs
              and breakwalls in October and November, offering some of the
              year{"'"}s best tautog fishing before the season closes.
            </p>
          </>
        ),
      },
      {
        heading: "Fishing Long Island Sound vs. the Open Atlantic",
        body: (
          <>
            <p>
              Most Connecticut party boats fish within Long Island Sound, where
              the water is relatively protected from open ocean swells. This
              makes Connecticut a particularly good option for anglers who are
              new to boat fishing or sensitive to rough seas. Conditions in the
              Sound are generally much calmer than what you would experience on
              boats fishing the open Atlantic.
            </p>
            <p>
              Some boats based in the eastern part of the state, near the Race
              and Plum Gut, venture beyond the Sound into Block Island Sound
              and the open Atlantic when conditions allow. These trips can
              produce larger Striped Bass, Bluefish, Fluke, and occasionally
              Bonito and False Albacore during the fall run. The stronger
              currents and deeper water in this area hold bigger fish, but the
              ride can be rougher.
            </p>
          </>
        ),
      },
      {
        heading: "What Connecticut Party Boats Provide",
        body: (
          <>
            <p>
              Connecticut party boats supply rods, reels, and terminal tackle
              as part of the fare. Bait is included on most trips, typically
              squid strips, clam, or bunker depending on the target species.
              A Connecticut saltwater fishing license (or a reciprocal license
              from a neighboring state) is typically required and should be
              purchased before boarding.
            </p>
            <p>
              Trips generally run 4 to 8 hours, with half-day trips being the
              most common option. Weekend trips fill up quickly during peak
              season, so booking ahead is advisable from June through October.
              Dress in layers, as mornings on the Sound can be cool even in
              summer, and the wind picks up in the afternoon.
            </p>
          </>
        ),
      },
    ],
  },

  delaware: {
    sections: [
      {
        heading: "Party Boat Fishing from the First State",
        body: (
          <>
            <p>
              Delaware{"'"}s position along the Mid-Atlantic coast gives its
              party boat fleet access to both the Delaware Bay and the open
              Atlantic Ocean. Despite its small size, Delaware is home to a
              dedicated fleet of head boats that operate out of ports like
              Lewes, Indian River Inlet, and the Rehoboth Beach area. These
              boats serve a loyal following of local anglers and draw visitors
              from nearby Philadelphia, Baltimore, and Washington, D.C. who
              want a day of ocean fishing without driving to the outer shore
              destinations.
            </p>
            <p>
              The Delaware coast sits in the heart of the Mid-Atlantic
              migration corridor, where species moving along the Eastern
              Seaboard pass through in predictable seasonal waves. This
              geographic advantage means Delaware{"'"}s party boats encounter
              the same species targeted by boats in New Jersey and Maryland,
              often at lower prices and with less crowding.
            </p>
          </>
        ),
      },
      {
        heading: "Delaware Bay and Atlantic Fishing Grounds",
        body: (
          <>
            <p>
              Delaware Bay is one of the largest estuaries on the East Coast
              and serves as a nursery for many commercially and recreationally
              important fish species. Party boats working the bay target
              Weakfish (Sea Trout), Croaker, Bluefish, and Striped Bass over
              sandy shoals and channel edges. The bay{"'"}s large population of
              horseshoe crabs attracts migrating shorebirds and also signals the
              annual arrival of many game fish species.
            </p>
            <p>
              Atlantic-side trips depart through the Indian River Inlet or from
              Lewes and head to offshore reefs, wrecks, and artificial reef
              sites. Black Sea Bass and Flounder are the bread-and-butter
              catches, with fish holding on structure in 50 to 120 feet of
              water. Further offshore, boats reach the Baltimore Canyon and
              other deep-water canyons where Bluefin Tuna, Yellowfin Tuna, and
              Mahi-Mahi are within reach during the summer and fall months.
            </p>
          </>
        ),
      },
      {
        heading: "Key Species by Season",
        body: (
          <>
            <p>
              Spring in Delaware starts with Tautog (Blackfish) on nearshore
              wrecks and rock piles, followed by the arrival of Black Sea Bass
              when the season opens. Flounder fishing picks up in May and
              remains strong through the summer as fish move onto sandy flats
              near the inlet and along the beach.
            </p>
            <p>
              Summer brings the widest variety of species. Bluefish show up in
              large schools, King Mackerel occasionally push this far north
              during warm-water years, and the offshore canyon trips begin
              producing Tuna and Mahi-Mahi. Croaker and Spot fill coolers for
              bottom fishermen working the bay.
            </p>
            <p>
              Fall is trophy season in Delaware. Large Striped Bass migrate
              through on their way south, Sea Bass bag limits are often at
              their most generous, and the fall Tautog run produces some of the
              largest fish of the year. Water temperatures stay fishable into
              November, and the fall colors along the coast make for pleasant
              days on the water.
            </p>
          </>
        ),
      },
    ],
  },

  georgia: {
    sections: [
      {
        heading: "Georgia's Coastal Fishing Waters",
        body: (
          <>
            <p>
              Georgia{"'"}s coast stretches roughly 100 miles from Savannah to
              the Florida border, bordered by a chain of barrier islands known
              as the Golden Isles. The waters offshore of St. Simons Island,
              Jekyll Island, Brunswick, and Savannah offer excellent fishing
              over live-bottom reef, artificial structures, and natural ledges
              that hold a mix of South Atlantic reef fish and seasonal pelagic
              species.
            </p>
            <p>
              Party boat fishing in Georgia puts anglers over productive fishing
              grounds in the South Atlantic Bight, where the continental shelf
              extends far offshore. The wide shelf means boats travel further to
              reach deep water, but the shallow live-bottom areas between shore
              and the shelf edge are rich with marine life. These natural hard-
              bottom areas support coral, sponges, and the fish communities that
              depend on them.
            </p>
          </>
        ),
      },
      {
        heading: "What Swims Off the Georgia Coast",
        body: (
          <>
            <p>
              Bottom fishing on Georgia party boats produces Black Sea Bass,
              Vermilion Snapper, Triggerfish, Porgy, Grunts, and various
              Grouper species including Red Grouper, Gag Grouper, and Scamp.
              The live-bottom reefs in 60 to 130 feet of water are loaded with
              structure that attracts these resident species year-round.
            </p>
            <p>
              King Mackerel are a major seasonal target, running along the
              Georgia coast from late spring through fall. Trolling trips target
              Kings as they follow schools of baitfish along the beach and over
              nearshore reefs. Cobia show up around buoys, wrecks, and Manta
              Rays in the spring and early summer, offering sight-fishing
              opportunities that are unique to the South Atlantic.
            </p>
            <p>
              During the summer months, the Gulf Stream pushes closer to the
              Georgia coast, bringing warm blue water and pelagic species like
              Mahi-Mahi and Wahoo within reach of longer party boat trips. Red
              Drum (Redfish) and Sheepshead are popular inshore targets for
              boats working the sounds and rivers behind the barrier islands.
            </p>
          </>
        ),
      },
      {
        heading: "Fishing Seasons and Conditions",
        body: (
          <>
            <p>
              Georgia{"'"}s moderate climate allows for party boat fishing from
              early spring through late fall, with some boats running trips
              year-round when weather permits. Water temperatures range from
              the mid-50s in winter to the mid-80s in summer, supporting
              different fisheries depending on the season.
            </p>
            <p>
              Spring and fall are considered the prime seasons. Water
              temperatures in the 65 to 75 degree range bring peak activity for
              most species, the weather is pleasant, and the seas are typically
              manageable. Summer fishing is productive but hot, with air
              temperatures regularly exceeding 90 degrees. Afternoon
              thunderstorms are common from June through August, and morning
              trips tend to have the best conditions.
            </p>
            <p>
              Georgia{"'"}s tidal range is among the largest on the East Coast,
              with swings of 6 to 9 feet. This strong tidal flow affects
              inshore and nearshore fishing patterns significantly, and
              experienced captains time their trips around the tides to
              maximize catch rates.
            </p>
          </>
        ),
      },
    ],
  },

  hawaii: {
    sections: [
      {
        heading: "Deep Sea Fishing in the Middle of the Pacific",
        body: (
          <>
            <p>
              Hawaii sits in the middle of the Pacific Ocean, surrounded by
              some of the deepest and most productive sport fishing waters on
              Earth. The ocean floor drops to over 1,000 feet within just a few
              miles of shore on most islands, giving party boats quick access to
              deep-water species that are beyond reach in nearly every other
              state. There is no continental shelf to cross, no long run to the
              fishing grounds, and no seasonal shutdown. Hawaii{"'"}s fishing is
              year-round.
            </p>
            <p>
              Group fishing trips in Hawaii operate from harbors on all the
              major islands, with the largest concentration of boats in Kona on
              the Big Island, Honolulu on Oahu, Lahaina on Maui, and
              Nawiliwili on Kauai. These shared charters sell individual spots
              and provide a more affordable way to experience world-class
              Pacific fishing.
            </p>
          </>
        ),
      },
      {
        heading: "The Billfish Capital of the World",
        body: (
          <>
            <p>
              Kona, Hawaii is recognized worldwide as one of the best places on
              the planet to catch Pacific Blue Marlin. The deep water off the
              leeward coast of the Big Island, combined with calm seas protected
              by the island{"'"}s volcanic peaks, creates ideal conditions for
              trolling. Blue Marlin, Striped Marlin, Spearfish, and Sailfish
              are all caught in Hawaiian waters, with fish over 500 pounds
              landed every year.
            </p>
            <p>
              While private charters are the traditional way to target
              billfish, several larger vessels offer shared trips where
              individual anglers can participate. These trips troll along the
              ledges and current lines where billfish feed, and every passenger
              gets a chance to fight a fish when one strikes.
            </p>
          </>
        ),
      },
      {
        heading: "Beyond Marlin: Hawaii's Other Catches",
        body: (
          <>
            <p>
              Yellowfin Tuna (Ahi) is one of the most sought-after catches in
              Hawaii, prized for sashimi-grade flesh and powerful fighting
              ability. Fish from 20 to over 200 pounds are caught year-round,
              with peak seasons varying by island. Skipjack Tuna (Aku) are
              abundant and provide fast action, often in large schools that
              keep rods bent for extended periods.
            </p>
            <p>
              Mahi-Mahi are one of the most colorful and exciting fish in the
              Pacific, and Hawaii{"'"}s warm waters hold them throughout the
              year. Wahoo (Ono) are another prized catch, known for blistering
              speed and excellent eating quality. Bottom fishing trips in Hawaii
              target species like Opakapaka (Pink Snapper), Onaga (Red Snapper),
              and various Grouper species over deep rocky structure.
            </p>
          </>
        ),
      },
      {
        heading: "Planning a Hawaii Fishing Trip",
        body: (
          <>
            <p>
              Hawaii{"'"}s biggest advantage for visiting anglers is the
              year-round season. There is no closed period, and productive
              fishing is available every month. Water temperatures remain
              between 74 and 82 degrees throughout the year, and the trade
              winds keep conditions pleasant even during the hottest months.
            </p>
            <p>
              The leeward (west) sides of the islands generally have calmer
              seas than the windward (east) sides, which is why most fishing
              fleets are based on the western coasts. Morning trips typically
              have the flattest water, and many boats depart at sunrise.
            </p>
            <p>
              Hawaii does not require a recreational saltwater fishing license
              for hook-and-line fishing, which simplifies trip planning. Most
              boats provide all tackle and gear, and crews are experienced at
              working with anglers of all skill levels, from first-timers to
              seasoned offshore fishermen.
            </p>
          </>
        ),
      },
    ],
  },

  louisiana: {
    sections: [
      {
        heading: "Louisiana: Where Oil Rigs Create a Fisherman's Paradise",
        body: (
          <>
            <p>
              Louisiana{"'"}s offshore waters in the Gulf of Mexico contain
              thousands of oil and gas platforms that function as some of the
              most productive artificial reefs on the planet. These towering
              steel structures attract entire ecosystems of marine life, from
              barnacles and small baitfish at the surface to Red Snapper,
              Amberjack, Cobia, and Yellowfin Tuna at depth. For party boat
              anglers, this means fishing over structure that holds enormous
              quantities of fish within a reasonable run from shore.
            </p>
            <p>
              Venice, Louisiana, located at the mouth of the Mississippi River,
              has earned the nickname {"\""}The Fishing Capital of the World
              {"\""} for good reason. The Mississippi dumps nutrient-rich
              freshwater into the Gulf, fueling a food chain that supports
              incredible concentrations of game fish. Party boats leaving from
              Venice and other Louisiana ports have some of the shortest runs to
              world-class offshore fishing found anywhere in the Gulf.
            </p>
          </>
        ),
      },
      {
        heading: "Offshore Species and Seasonal Patterns",
        body: (
          <>
            <p>
              Red Snapper is Louisiana{"'"}s most targeted offshore species,
              and the state{"'"}s waters hold some of the highest densities of
              Red Snapper in the Gulf of Mexico. Federal and state season dates
              determine when these fish can be harvested, but when the season
              is open, action is almost guaranteed on the oil rig structure.
              Fish commonly range from 5 to over 20 pounds.
            </p>
            <p>
              Yellowfin Tuna fishing sets Louisiana apart from most other Gulf
              states. The deep water near the mouth of the Mississippi, combined
              with oil rig structure in 400 to 1,500 feet of water, creates
              ideal habitat for Yellowfin that can exceed 200 pounds. Longer
              party boat trips that target these rigs offer some of the best
              tuna fishing available anywhere in the continental United States.
            </p>
            <p>
              Greater Amberjack, Cobia, Vermilion Snapper, Triggerfish, King
              Mackerel, Wahoo, and Mahi-Mahi round out the offshore catch
              calendar. Mangrove Snapper fishing on nearshore rigs is
              exceptionally productive during summer nights, and some boats
              offer dedicated night trips for Snapper and other reef species.
            </p>
          </>
        ),
      },
      {
        heading: "Inshore and Nearshore Fishing",
        body: (
          <>
            <p>
              Louisiana{"'"}s vast marshlands and estuaries support world-class
              inshore fishing that complements the offshore party boat scene.
              While most inshore fishing is done from smaller boats, the
              nearshore Gulf waters accessible to larger vessels hold Speckled
              Trout, Redfish, Sheepshead, and Drum. Some party boats offer
              nearshore trips that work the jetties, nearshore rigs, and
              shallow-water structure along the coast.
            </p>
            <p>
              The Louisiana marsh system is the largest wetland in the
              continental United States and produces more seafood per acre than
              almost any other marine environment. This biological productivity
              ripples outward into the nearshore and offshore waters, feeding
              the entire food chain that makes Louisiana{"'"}s fishing so
              exceptional.
            </p>
          </>
        ),
      },
      {
        heading: "When to Fish Louisiana",
        body: (
          <>
            <p>
              Louisiana{"'"}s fishing season runs year-round, with water
              temperatures that rarely drop below 60 degrees even in the
              coldest winter months. Spring brings the return of Cobia and the
              beginning of the offshore season for most species. Summer is peak
              season, with Red Snapper, Yellowfin Tuna, and Mahi-Mahi all
              active. Fall offers comfortable weather, smaller crowds, and
              continued strong fishing for most offshore species.
            </p>
            <p>
              Hurricane season runs from June through November and can
              occasionally disrupt fishing schedules. Captains monitor weather
              closely and will reschedule trips when conditions are unsafe. The
              days following a tropical weather system often produce some of the
              best fishing of the year, as stirred-up water triggers aggressive
              feeding behavior.
            </p>
          </>
        ),
      },
    ],
  },

  maine: {
    sections: [
      {
        heading: "Deep Sea Fishing in Maine's Cold, Rich Waters",
        body: (
          <>
            <p>
              Maine{"'"}s rocky coastline stretches over 3,400 miles when you
              count its countless bays, inlets, and peninsulas, making it one
              of the most complex and productive coastlines in North America.
              The cold waters of the Gulf of Maine support a thriving deep-sea
              fishing industry that has attracted anglers for generations. Party
              boats operating out of ports like Portland, Boothbay Harbor,
              Kennebunkport, and Bar Harbor take passengers to fishing grounds
              where cold-water species thrive in abundance.
            </p>
            <p>
              The Gulf of Maine is a semi-enclosed sea bordered by Georges Bank
              to the south and the Scotian Shelf to the east. Cold, nutrient-
              rich upwellings fuel an ecosystem that supports everything from
              lobsters and crabs to schools of game fish. For party boat anglers,
              these productive waters translate into reliable catches and a
              fishing experience set against some of the most scenic coastal
              landscapes in the country.
            </p>
          </>
        ),
      },
      {
        heading: "Cod, Haddock, and Pollock: New England Groundfish",
        body: (
          <>
            <p>
              Atlantic Cod, Haddock, and Pollock are the traditional targets
              for Maine{"'"}s party boat fleet. These groundfish hold over
              rocky bottom, wrecks, and ledges in 100 to 300 feet of water
              and provide steady bottom-fishing action using clam bait, jigs,
              or diamond jigs. A fresh Haddock dinner from fish you caught that
              morning is a quintessential Maine experience.
            </p>
            <p>
              Groundfish regulations in the Gulf of Maine have fluctuated over
              the years in response to stock assessments, and bag limits for
              Cod in particular have been restrictive. Haddock has rebounded
              strongly, and generous bag limits have made it the primary bottom-
              fishing target on most trips. Party boat crews stay current on
              the latest regulations and will ensure your catch complies with
              all federal and state rules.
            </p>
          </>
        ),
      },
      {
        heading: "Stripers, Sharks, and the Summer Run",
        body: (
          <>
            <p>
              Striped Bass migrate into Maine waters each summer, arriving in
              June and remaining through October. These fish follow schools of
              herring and mackerel along the coast, and some party boats offer
              dedicated Striper trips working the river mouths, rocky
              shorelines, and islands where bass concentrate. Maine{"'"}s
              Striped Bass fishery has been strong in recent years, with fish
              in the 20 to 40 inch range commonly caught.
            </p>
            <p>
              Shark fishing trips have grown in popularity along the Maine
              coast, with Blue Sharks and Porbeagle Sharks being the primary
              targets. These trips typically run as full-day excursions to
              offshore waters where chumming attracts sharks to the boat. Bluefin
              Tuna also pass through the Gulf of Maine from July through
              November, and while most tuna fishing is done from private
              charters, some larger vessels offer group trips when conditions
              are right.
            </p>
          </>
        ),
      },
      {
        heading: "The Maine Fishing Experience",
        body: (
          <>
            <p>
              Fishing in Maine comes with cool ocean breezes, fog that burns off
              by mid-morning, lighthouse views, and the chance to spot whales,
              seals, and porpoises while you fish. The season runs primarily
              from May through October, with peak fishing in July and August
              when water temperatures reach their annual highs of 55 to 65
              degrees.
            </p>
            <p>
              Even in summer, the water in Maine is cold. Dressing in layers
              and bringing a waterproof jacket is important, as conditions can
              change quickly on the open ocean. Most party boats have covered
              cabins for shelter, and hot coffee is a staple on early morning
              departures.
            </p>
          </>
        ),
      },
    ],
  },

  maryland: {
    sections: [
      {
        heading: "Maryland: Where the Chesapeake Meets the Atlantic",
        body: (
          <>
            <p>
              Maryland offers party boat anglers two distinct fishing
              environments that most other states cannot match. The Chesapeake
              Bay, the largest estuary in the United States, provides sheltered
              waters loaded with Striped Bass, Bluefish, Croaker, and Spot. The
              Atlantic coast at Ocean City opens the door to offshore canyon
              fishing for Tuna, Mahi-Mahi, Marlin, and a full lineup of bottom
              species on wrecks and artificial reefs.
            </p>
            <p>
              This dual identity gives Maryland{"'"}s fishing a versatility that
              appeals to every kind of angler. You can spend a calm morning
              trolling for Rockfish in the Chesapeake and the next day head 60
              miles offshore from Ocean City chasing Yellowfin Tuna over
              submarine canyons. Party boats operating from both regions provide
              affordable access to these diverse fisheries.
            </p>
          </>
        ),
      },
      {
        heading: "Chesapeake Bay Fishing",
        body: (
          <>
            <p>
              The Chesapeake Bay is Maryland{"'"}s defining waterway and one of
              the most important recreational fishing destinations on the East
              Coast. Striped Bass, known locally as Rockfish, are the star
              attraction. Maryland{"'"}s trophy Rockfish season draws anglers
              from across the Mid-Atlantic each spring, with fish over 40
              inches commonly caught on party boats trolling umbrella rigs and
              parachute jigs through the shipping channels and around the Bay
              Bridge pilings.
            </p>
            <p>
              Bluefish, White Perch, Croaker, Spot, and Norfolk Spot provide
              action throughout the summer months. The Chesapeake{"'"}s shallow
              depths and protected waters make bay fishing trips accessible for
              families, beginners, and anglers who prefer calm conditions. Party
              boats working the bay are often smaller than their ocean
              counterparts, with a more intimate fishing experience.
            </p>
          </>
        ),
      },
      {
        heading: "Ocean City and the Offshore Canyons",
        body: (
          <>
            <p>
              Ocean City, Maryland is the jumping-off point for some of the
              best offshore fishing in the Mid-Atlantic. The Baltimore Canyon,
              Washington Canyon, Norfolk Canyon, and Poor Man{"'"}s Canyon are
              all within range of the party boat fleet, and these deep-water
              trenches hold Yellowfin Tuna, Bigeye Tuna, Bluefin Tuna,
              Mahi-Mahi, Wahoo, and White Marlin during the warmer months.
            </p>
            <p>
              Nearshore wreck and reef fishing out of Ocean City produces Sea
              Bass, Flounder, Tautog, and Bluefish over structure in 40 to 120
              feet of water. The artificial reef program off the Maryland coast
              has created productive fishing sites within a short run from the
              inlet, making half-day trips possible for bottom species.
            </p>
            <p>
              The White Marlin Open, held annually in Ocean City, is one of
              the largest and richest billfish tournaments in the world. While
              the tournament is contested by private boats, the event highlights
              the caliber of fishing available in these waters. Party boat
              anglers fishing the same canyons during the summer and fall
              benefit from the same productive conditions.
            </p>
          </>
        ),
      },
    ],
  },

  massachusetts: {
    sections: [
      {
        heading: "Massachusetts: From Cape Cod to Stellwagen Bank",
        body: (
          <>
            <p>
              Massachusetts has one of the richest saltwater fishing traditions
              in the United States, dating back centuries to the cod fishermen
              who built the state{"'"}s economy. Today, party boats operating
              from ports like Plymouth, Gloucester, Hyannis, Provincetown, and
              Boston continue that tradition by taking passengers to fish the
              same productive waters. Cape Cod, Stellwagen Bank, and the shoals
              south of the islands are all within reach of the party boat fleet.
            </p>
            <p>
              Stellwagen Bank, a federally protected marine sanctuary north of
              Provincetown, is one of the most biologically productive areas in
              the North Atlantic. The bank{"'"}s shallow depths (65 to 100 feet
              on top) create upwellings that concentrate baitfish, which in turn
              attract everything from Humpback Whales to Bluefin Tuna. Party
              boats fishing Stellwagen Bank offer a unique combination of
              fishing and wildlife viewing.
            </p>
          </>
        ),
      },
      {
        heading: "Cod, Haddock, and the Bottom Fishing Tradition",
        body: (
          <>
            <p>
              Bottom fishing for Cod and Haddock remains the backbone of the
              Massachusetts party boat industry. Haddock populations have
              recovered dramatically, and generous bag limits make them the most
              reliable and plentiful catch on full-day deep-sea trips. Fish in
              the 2 to 6 pound range are standard, with larger specimens
              reaching 10 pounds or more on deeper structure.
            </p>
            <p>
              Cod regulations are more restrictive, but targeted trips during
              open seasons still produce fish in the 10 to 30 pound range over
              rocky ledges and wrecks. Pollock, Cusk, and White Hake round out
              the groundfish catches, and mixed bags of multiple species on a
              single trip are common.
            </p>
          </>
        ),
      },
      {
        heading: "Striped Bass, Bluefin Tuna, and Seasonal Runs",
        body: (
          <>
            <p>
              Striped Bass fishing in Massachusetts is legendary. The fish
              migrate into Cape Cod Bay, Buzzards Bay, and along the outer Cape
              beaches starting in May, and the fishing remains strong through
              October. Party boats targeting Stripers work the rips, shoals,
              and structure where bass ambush baitfish, using live bait, jigs,
              and trolling techniques.
            </p>
            <p>
              Bluefin Tuna have made a remarkable comeback in Massachusetts
              waters, with fish ranging from 30-pound school tuna to 800-pound
              giants showing up on Stellwagen Bank and around the Cape from
              June through November. While most giant Bluefin fishing is done on
              private charters, party boats occasionally target school-size
              Bluefin and the experience of watching these fish feed on the
              surface is unforgettable.
            </p>
            <p>
              Bluefish, Fluke, Sea Bass, Scup, and Black Sea Bass fill the
              summer fishing calendar, and the fall run of False Albacore and
              Bonito along the outer Cape beaches has developed a cult following
              among light-tackle anglers.
            </p>
          </>
        ),
      },
    ],
  },

  mississippi: {
    sections: [
      {
        heading: "Party Boat Fishing on the Mississippi Gulf Coast",
        body: (
          <>
            <p>
              Mississippi{"'"}s 62-mile Gulf Coast may be short, but it opens
              the door to a vast offshore fishing territory. Biloxi, Gulfport,
              and Pass Christian serve as the primary ports for party boat
              operations that take anglers into the fertile waters of the
              Mississippi Sound and the Gulf of Mexico. The proximity to the
              Mississippi River Delta means these waters receive a constant
              supply of nutrients that drives one of the most productive marine
              food chains in the Gulf.
            </p>
            <p>
              The Mississippi party boat scene is closely tied to the state
              {"'"}s gaming and tourism industry along the coast. Visitors who
              come for the casinos, beaches, and seafood restaurants often add
              a fishing trip to their itinerary, and the affordability of party
              boat tickets makes it an easy decision.
            </p>
          </>
        ),
      },
      {
        heading: "Barrier Islands and Offshore Rigs",
        body: (
          <>
            <p>
              The barrier islands off the Mississippi coast, including Ship
              Island, Horn Island, and Cat Island, create protected fishing
              areas where party boats target Speckled Trout, Redfish, Spanish
              Mackerel, and Sheepshead. These nearshore trips offer calmer
              conditions and are well-suited for families and beginners.
            </p>
            <p>
              Offshore trips push into the Gulf to fish around oil and gas
              platforms, artificial reefs, and natural bottom structure. Red
              Snapper is the premier target on these trips, and Mississippi{"'"}s
              state-managed Red Snapper season has been expanding, giving
              anglers more days to harvest these prized reef fish. Greater
              Amberjack, Triggerfish, Vermilion Snapper, King Mackerel, and
              Cobia are all regularly caught on offshore runs.
            </p>
          </>
        ),
      },
      {
        heading: "Year-Round Fishing and Local Flavor",
        body: (
          <>
            <p>
              Mississippi{"'"}s subtropical climate keeps water temperatures
              warm enough for fishing in every month of the year. Summer is the
              peak season with the warmest water, calmest seas, and the widest
              variety of species available. Spring and fall offer excellent
              fishing with more comfortable air temperatures and fewer crowds
              at the docks. Winter fishing slows down for some species but
              bottom fishing for Sheepshead and Black Drum remains productive.
            </p>
            <p>
              A party boat trip on the Mississippi Gulf Coast often ends with a
              stop at one of the many waterfront seafood restaurants where you
              can have your catch cooked while you enjoy the rest of the day.
              The combination of affordable fishing, Southern hospitality, and
              fresh Gulf seafood gives the Mississippi fishing experience a
              character all its own.
            </p>
          </>
        ),
      },
    ],
  },

  "new-hampshire": {
    sections: [
      {
        heading: "New Hampshire's 18 Miles of Fishing Coastline",
        body: (
          <>
            <p>
              New Hampshire has the shortest ocean coastline of any coastal
              state in the country at just 18 miles, but that compact stretch
              of shore punches far above its weight in fishing productivity.
              Hampton Beach, Rye Harbor, and Portsmouth serve as the home ports
              for a small but dedicated party boat fleet that takes anglers into
              the Gulf of Maine and the Isles of Shoals, a rocky island group
              that sits nine miles offshore and serves as a gathering point for
              game fish, seabirds, and marine mammals.
            </p>
            <p>
              What New Hampshire lacks in coastline, it makes up for with
              proximity to some of the best fishing structure in the Gulf of
              Maine. Jeffrey{"'"}s Ledge, a massive underwater plateau about
              25 miles offshore, is a premier fishing destination that holds
              concentrations of Cod, Haddock, Pollock, and other groundfish
              species. Party boats from New Hampshire reach Jeffrey{"'"}s Ledge
              in under two hours, and the fishing there can rival trips from
              any port in New England.
            </p>
          </>
        ),
      },
      {
        heading: "Groundfish, Stripers, and Seasonal Highlights",
        body: (
          <>
            <p>
              Deep-sea bottom fishing for Haddock and Cod is the foundation of
              New Hampshire{"'"}s party boat industry. Trips to Jeffrey{"'"}s
              Ledge and the lumps and humps scattered across the Gulf of Maine
              produce Haddock in large numbers during the summer months, with
              Pollock providing additional action on jigs and diamond jigs worked
              through the water column.
            </p>
            <p>
              Striped Bass move into New Hampshire{"'"}s coastal waters from
              June through October, with fish working the rocky shorelines of
              the Isles of Shoals and the river mouths along the seacoast.
              Bluefish often arrive alongside the Stripers, and some party boats
              offer combination trips that target both species in a single
              outing.
            </p>
            <p>
              Mackerel fishing provides fast action during the summer and serves
              as an excellent introduction to saltwater fishing for children and
              beginners. The small, scrappy fish are easy to catch, fun to reel
              in, and make excellent bait for Striper and Bluefish fishermen.
            </p>
          </>
        ),
      },
      {
        heading: "A Compact Coast with Big Rewards",
        body: (
          <>
            <p>
              The concentrated nature of New Hampshire{"'"}s coast means the
              docks, bait shops, restaurants, and party boat operations are all
              within a short drive of each other. Hampton Beach is the hub of
              the fishing activity, with several boats departing daily during
              the peak season from June through September. The beach town
              atmosphere, boardwalk, and waterfront dining make it easy to pair
              a fishing trip with a full day of coastal recreation.
            </p>
            <p>
              Trips are generally shorter than those from ports further north
              in Maine, with most half-day trips running 4 to 5 hours and
              full-day deep-sea trips to Jeffrey{"'"}s Ledge running 8 to 10
              hours. The shorter transit times mean more time fishing and less
              time riding, which is a real advantage for passengers who are not
              accustomed to long periods on the ocean.
            </p>
          </>
        ),
      },
    ],
  },

  "new-jersey": {
    sections: [
      {
        heading: "New Jersey: The Northeast's Party Boat Capital",
        body: (
          <>
            <p>
              New Jersey has one of the largest and most active party boat fleets
              on the entire East Coast. From Sandy Hook to Cape May, the
              Jersey Shore is lined with marinas and docks that launch head boats
              every day of the fishing season. The state{"'"}s central position
              on the Atlantic seaboard, combined with the underwater topography
              of artificial reefs, natural rock piles, wrecks, and the Hudson
              Canyon, gives New Jersey party boats access to a remarkable
              diversity of species.
            </p>
            <p>
              The party boat tradition runs deep in New Jersey. Families have
              been riding head boats out of ports like Point Pleasant, Belmar,
              Barnegat Light, Atlantic City, and Wildwood for generations. The
              boats range from 65-foot inshore vessels that work the local reefs
              to 90-foot offshore cruisers that make overnight runs to the
              canyons for Tuna and Tilefish.
            </p>
          </>
        ),
      },
      {
        heading: "An Incredible Wreck and Reef System",
        body: (
          <>
            <p>
              New Jersey{"'"}s coastline sits atop one of the most wreck-rich
              stretches of ocean in the world. Centuries of maritime traffic
              through the approaches to New York Harbor have left hundreds of
              shipwrecks on the ocean floor, and the state has supplemented
              these with an aggressive artificial reef program. Fifteen
              designated reef sites off the Jersey coast contain everything from
              retired subway cars and tanks to concrete rubble and purpose-built
              reef structures.
            </p>
            <p>
              This abundance of underwater structure creates outstanding habitat
              for Black Sea Bass, Tautog, Fluke, Ling (Red Hake), Cod, and
              various Shark species. The wrecks in 60 to 130 feet of water are
              the primary fishing grounds for most inshore party boat trips,
              and each wreck holds its own ecosystem of resident fish.
            </p>
          </>
        ),
      },
      {
        heading: "Seasonal Species and the Canyon Run",
        body: (
          <>
            <p>
              New Jersey{"'"}s fishing calendar starts in March with Mackerel
              and Ling, transitions to Fluke and Sea Bass in late spring,
              peaks with Bluefish, Striped Bass, and offshore Tuna from June
              through September, and finishes with a world-class fall Tautog
              bite and trophy Striped Bass runs in October and November.
            </p>
            <p>
              Canyon trips are a specialty of the New Jersey fleet. Overnight
              runs to the Hudson Canyon, Block Canyon, and Toms Canyon target
              Yellowfin Tuna, Bigeye Tuna, Longfin Albacore, Mahi-Mahi, and
              Tilefish. These trips depart in the late evening, run through
              the night to reach the deep water, fish all day, and return by
              the following evening. They are among the most ambitious party
              boat trips available anywhere on the East Coast.
            </p>
            <p>
              Fluke fishing deserves special mention. New Jersey{"'"}s sandy
              bottom and structure-rich coastline make it one of the top
              destinations for Summer Flounder, and doormat-size Fluke over 10
              pounds are caught every season on drift-fishing trips.
            </p>
          </>
        ),
      },
    ],
  },

  "new-york": {
    sections: [
      {
        heading: "New York's Diverse Party Boat Fleet",
        body: (
          <>
            <p>
              New York{"'"}s party boat fishing spans an enormous range of
              environments, from the protected waters of Long Island Sound to
              the deep offshore canyons of the Atlantic. Montauk, at the eastern
              tip of Long Island, is one of the most famous fishing ports in
              the country, but party boats also operate from Sheepshead Bay in
              Brooklyn, Captree State Park, Freeport, and ports along the
              Hudson River and Long Island Sound.
            </p>
            <p>
              The proximity of world-class fishing to the New York City
              metropolitan area makes the state{"'"}s party boat fleet one of
              the busiest in the nation. Millions of potential anglers live
              within a short drive of the docks, and party boats provide the
              most accessible and affordable way for city residents and visitors
              to experience ocean fishing.
            </p>
          </>
        ),
      },
      {
        heading: "Montauk: The Fishing Capital of the East",
        body: (
          <>
            <p>
              Montauk sits where Long Island Sound, Block Island Sound, and the
              open Atlantic Ocean converge, creating a mixing zone of currents,
              temperatures, and structure that attracts fish from multiple
              migration routes. Party boats from Montauk fish for Striped Bass,
              Bluefish, Fluke, Sea Bass, Porgy, Cod, and Shark within sight of
              the iconic Montauk Lighthouse.
            </p>
            <p>
              The fall Striped Bass run at Montauk is legendary. From September
              through November, large Stripers migrate through the rips and
              along the beaches, and party boats loaded with fishermen work the
              points and shoals for fish that can exceed 50 pounds. The Montauk
              fall run draws anglers from across the Northeast and is considered
              one of the premier seasonal fishing events on the Atlantic coast.
            </p>
          </>
        ),
      },
      {
        heading: "Brooklyn, Captree, and the Metro Fleet",
        body: (
          <>
            <p>
              Sheepshead Bay in Brooklyn has been home to party boats since the
              early 1900s and remains the most convenient departure point for
              New York City residents. Boats here fish the local wrecks and reefs
              for Sea Bass, Fluke, Porgies, and seasonal Bluefish, with some
              operators running longer trips to the offshore grounds for Cod,
              Ling, and Tilefish.
            </p>
            <p>
              Captree State Park on the South Shore of Long Island is another
              major hub, with a large fleet of party boats and open boats that
              fish the Fire Island Inlet area and the nearshore Atlantic. The
              Captree fleet specializes in Fluke, Sea Bass, Striped Bass, and
              Bluefish, with easy access from the Southern State Parkway making
              it a popular weekend destination.
            </p>
            <p>
              Whether you are looking for a quick half-day trip out of Brooklyn
              or an overnight canyon run from Montauk, New York{"'"}s party boat
              fleet covers the full spectrum of saltwater fishing experiences
              available in the Northeast.
            </p>
          </>
        ),
      },
    ],
  },

  "north-carolina": {
    sections: [
      {
        heading: "North Carolina: Where the Gulf Stream Comes Close",
        body: (
          <>
            <p>
              North Carolina{"'"}s position on the Atlantic coast places it
              at a unique geographic crossroads where northern and southern
              marine ecosystems overlap. The warm waters of the Gulf Stream
              sweep within 20 to 40 miles of shore near Cape Hatteras and Cape
              Lookout, bringing tropical species like Mahi-Mahi, Wahoo, and
              Yellowfin Tuna remarkably close to the coast. At the same time,
              the cooler Labrador Current pushes down from the north, creating
              a mixing zone that supports an extraordinary variety of fish.
            </p>
            <p>
              This convergence of warm and cool currents gives North Carolina
              party boats access to species that would normally require much
              longer runs in other states. The result is a fishing scene that
              blends the bottom fishing of the Mid-Atlantic with the pelagic
              action more commonly associated with South Florida or the Gulf
              of Mexico.
            </p>
          </>
        ),
      },
      {
        heading: "The Outer Banks and Beyond",
        body: (
          <>
            <p>
              The Outer Banks are a chain of barrier islands that extend into
              the Atlantic like a natural fishing pier, placing anglers closer
              to offshore structure and the Gulf Stream than almost any other
              point on the East Coast. Hatteras, Oregon Inlet, and Nags Head
              are legendary fishing ports that have produced world-record catches
              of Blue Marlin, Bluefin Tuna, and other big-game species.
            </p>
            <p>
              Party boats from the Outer Banks fish the inshore sounds, the
              nearshore wrecks and reefs, and the offshore waters approaching
              the Gulf Stream. The variety is staggering: Red Drum in Pamlico
              Sound, Black Sea Bass and Triggerfish on the wrecks, King Mackerel
              over the shoals, and Yellowfin Tuna and Mahi-Mahi on the blue-
              water trips. Diamond Shoals off Cape Hatteras is a natural fish
              aggregation point that has drawn fishermen for centuries.
            </p>
          </>
        ),
      },
      {
        heading: "Morehead City, Wilmington, and Southern Ports",
        body: (
          <>
            <p>
              Further south, Morehead City and Atlantic Beach sit along Bogue
              Sound and provide access to Beaufort Inlet and the rich fishing
              grounds of Onslow Bay. Party boats here run to nearshore live-
              bottom areas, offshore wrecks, and the ledges at the edge of the
              continental shelf where Grouper, Snapper, Amberjack, and Tilefish
              hold in good numbers.
            </p>
            <p>
              Wilmington and Carolina Beach in the southern part of the state
              offer party boat trips that fish the Frying Pan Shoals and the
              artificial reefs off the Cape Fear coast. The warm water influence
              of the Gulf Stream reaches these waters for much of the year,
              supporting species like King Mackerel, Spanish Mackerel, Cobia,
              and Mahi-Mahi alongside the standard bottom fish catches.
            </p>
            <p>
              North Carolina requires no saltwater recreational fishing license
              for hook-and-line fishing from licensed party boats and charter
              boats, which is a significant advantage for visiting anglers. The
              boat{"'"}s license covers all passengers on board.
            </p>
          </>
        ),
      },
      {
        heading: "Seasonal Fishing Guide for North Carolina",
        body: (
          <>
            <p>
              Spring brings the arrival of Cobia, King Mackerel, and Mahi-Mahi
              as water temperatures rise into the 70s. Bottom fishing for
              Grouper and Snapper is productive in spring and continues through
              the summer. Summer is peak season with the widest variety of
              species and the warmest weather, though afternoon thunderstorms
              are common and boats typically depart early.
            </p>
            <p>
              Fall is considered the best all-around fishing season in North
              Carolina. Cooling water temperatures trigger migration runs of
              Striped Bass, False Albacore, Bluefish, and Red Drum. King
              Mackerel bite aggressively through October. The fall weather is
              generally dry and comfortable, making for pleasant days on the
              water with fewer crowds than summer.
            </p>
          </>
        ),
      },
    ],
  },

  oregon: {
    sections: [
      {
        heading: "Oregon's Rugged Pacific Coastline",
        body: (
          <>
            <p>
              Oregon{"'"}s 363 miles of Pacific coastline offer some of the
              most dramatic and productive fishing waters on the West Coast.
              Towering sea cliffs, rocky headlands, and river bars characterize
              a coast that faces the full force of the Pacific Ocean. Party
              boats and charter vessels operate from ports like Newport,
              Depoe Bay, Astoria, Garibaldi, Winchester Bay, and Charleston
              (Coos Bay), taking anglers to fish the reefs, pinnacles, and
              offshore banks that hold a bounty of Pacific species.
            </p>
            <p>
              The Oregon coast sits along the Pacific{"'"}s upwelling zone,
              where cold, nutrient-rich water rises from the deep ocean to
              the surface. This upwelling fuels an enormously productive food
              chain that starts with phytoplankton and extends to the large
              game fish, marine mammals, and seabirds that anglers encounter
              on fishing trips. The biological richness of Oregon{"'"}s waters
              ensures that productive fishing is available throughout the
              season.
            </p>
          </>
        ),
      },
      {
        heading: "Halibut, Lingcod, and Rockfish",
        body: (
          <>
            <p>
              Pacific Halibut is the premier bottom fish target on Oregon party
              boats. These prized flatfish are caught over sandy bottom in 120
              to 400 feet of water, with fish commonly ranging from 15 to 50
              pounds. The Halibut season in Oregon is managed through quotas
              and can close when the allocation is reached, so booking early
              during open periods is important. The spring all-depth Halibut
              season is the most popular, and trips fill quickly.
            </p>
            <p>
              Lingcod are an aggressive predator found on rocky reefs and
              pinnacles from 60 to 300 feet deep. These large fish, often
              reaching 20 to 40 pounds, are known for striking hard and
              fighting all the way to the surface. Their firm, white flesh is
              considered among the finest eating fish in the Pacific.
            </p>
            <p>
              Rockfish come in dozens of varieties off Oregon, including Black
              Rockfish, Blue Rockfish, Canary Rockfish, Yelloweye Rockfish,
              and China Rockfish. These colorful reef fish are the backbone of
              Oregon{"'"}s bottom fishing trips and provide consistent action
              when conditions allow boats to get offshore.
            </p>
          </>
        ),
      },
      {
        heading: "Salmon Fishing on the Oregon Coast",
        body: (
          <>
            <p>
              Oregon{"'"}s salmon fishery is legendary. Chinook (King) Salmon
              and Coho (Silver) Salmon are the primary targets, with trolling
              trips running from April through October depending on season
              openings and run strength. The Columbia River and its tributaries
              support massive salmon runs, and ocean salmon fishing off the
              northern Oregon coast benefits from these populations.
            </p>
            <p>
              Salmon seasons in Oregon are set annually based on return
              projections and can vary significantly from year to year. When
              the ocean salmon season is open, it draws intense interest from
              anglers across the Pacific Northwest, and party boats fill
              quickly. The thrill of hooking a 20-pound Chinook on the troll
              and fighting it to the boat is an experience that defines Pacific
              Northwest fishing.
            </p>
          </>
        ),
      },
      {
        heading: "Ocean Conditions and Trip Planning",
        body: (
          <>
            <p>
              The Oregon coast is known for challenging ocean conditions,
              particularly during winter and early spring when large swells and
              strong winds are common. The best weather window for fishing runs
              from late May through September, when seas are typically calmer
              and fog is less persistent. Even in summer, conditions can change
              rapidly, and captains will cancel trips when bar conditions are
              unsafe for crossing.
            </p>
            <p>
              Dressing warmly is essential on Oregon party boats, even in
              summer. Ocean temperatures rarely exceed 55 degrees, and wind
              chill on the open water can make it feel significantly colder.
              Waterproof layers, warm hats, and gloves are recommended. The
              payoff for braving these conditions is fishing in waters that are
              less pressured than many other coastal destinations and scenery
              that includes coastal mountains, sea stacks, and wildlife at
              every turn.
            </p>
          </>
        ),
      },
    ],
  },

  pennsylvania: {
    sections: [
      {
        heading: "Lake Erie: Pennsylvania's Freshwater Fishing Frontier",
        body: (
          <>
            <p>
              Pennsylvania is the only state in this guide without an ocean
              coastline, but its 63 miles of Lake Erie shoreline support a
              thriving party boat and head boat fishery that rivals many
              saltwater destinations for action and variety. The city of Erie
              and the port at Presque Isle Bay serve as the home base for boats
              that fish the eastern basin of Lake Erie, one of the most
              productive freshwater fisheries in North America.
            </p>
            <p>
              Lake Erie is the shallowest and warmest of the Great Lakes, which
              makes it incredibly fertile. The lake produces more fish per acre
              than any of the other Great Lakes, and its relatively compact
              eastern basin concentrates fish in ways that make party boat
              fishing consistently productive. For anglers in the Pittsburgh,
              Cleveland, and Buffalo metro areas, a party boat trip out of Erie
              is one of the most accessible fishing adventures available.
            </p>
          </>
        ),
      },
      {
        heading: "Walleye: Lake Erie's Prized Catch",
        body: (
          <>
            <p>
              Walleye are the headline species on Lake Erie party boats and the
              fish that draws the most anglers to the lake each year. Lake Erie
              {"'"}s Walleye population is one of the largest and healthiest in
              the world, with annual hatches producing strong year-classes that
              sustain excellent catch rates. Fish in the 2 to 6 pound range make
              up the bulk of the catch, with trophy fish over 10 pounds caught
              every season.
            </p>
            <p>
              Walleye fishing on party boats typically involves trolling with
              worm harnesses, crankbaits, or spoons at speeds of 1 to 2 miles
              per hour over open water structure. Captains use sonar and GPS to
              locate schools of fish and position the boat for the best
              trolling passes. The technique is easy for beginners to learn, and
              the crew handles rod setup, line deployment, and net duties.
            </p>
          </>
        ),
      },
      {
        heading: "Steelhead, Perch, and Smallmouth Bass",
        body: (
          <>
            <p>
              Steelhead Trout run into the tributary streams along the Lake Erie
              shore from October through April, and some party boats offer
              late-season lake trolling trips that target Steelhead in open
              water. These chrome-bright fish, typically 4 to 10 pounds, are
              among the hardest-fighting freshwater fish and are prized by
              anglers who enjoy light-tackle battles.
            </p>
            <p>
              Yellow Perch are a Lake Erie staple, especially during the fall
              and winter months when large schools move into shallower water and
              become accessible to drift-fishing techniques. Perch fishing is
              family-friendly, with simple tackle and easy-to-learn methods that
              produce buckets of fish for the frying pan. Smallmouth Bass
              provide outstanding catch-and-release fishing during the summer,
              with fish in the 2 to 5 pound range commonly caught on rocky
              reefs and drop-offs.
            </p>
          </>
        ),
      },
      {
        heading: "Fishing Lake Erie from Pennsylvania",
        body: (
          <>
            <p>
              The Lake Erie fishing season runs from April through December,
              with Walleye being the primary target from May through October.
              Perch fishing picks up in September and remains strong through
              the fall. Steelhead trolling begins in October as the fish stage
              in the lake before entering tributaries.
            </p>
            <p>
              A Pennsylvania fishing license with a Lake Erie permit is required
              and should be purchased before boarding. Most party boats provide
              all rods, reels, tackle, and bait, making the trips truly
              turn-key for visiting anglers. Trips typically run 6 to 8 hours,
              departing early in the morning from the marinas along Presque
              Isle Bay.
            </p>
          </>
        ),
      },
    ],
  },

  "rhode-island": {
    sections: [
      {
        heading: "Rhode Island: Small State, Big Fishing",
        body: (
          <>
            <p>
              Rhode Island may be the smallest state in the country, but its
              fishing punches well above its weight class. The waters off
              Narragansett Bay, Block Island, and the Rhode Island Sound sit
              at the intersection of major migration routes for Striped Bass,
              Bluefish, Fluke, and Tuna. Party boats operating from Point
              Judith, Galilee, Newport, and other coastal ports take advantage
              of these productive waters to offer fishing that competes with
              anything available in the Northeast.
            </p>
            <p>
              Block Island, located 13 miles off the coast, acts as an
              underwater mountain that disrupts currents and concentrates
              baitfish. The rips, shoals, and rock piles around the island are
              legendary fishing spots that hold large Striped Bass, Bluefish,
              and Fluke during their seasonal migrations. Several party boats
              make the run to Block Island regularly during the summer and
              fall months.
            </p>
          </>
        ),
      },
      {
        heading: "Cod, Tautog, and the Bottom Bite",
        body: (
          <>
            <p>
              Bottom fishing is a strength of Rhode Island{"'"}s party boat
              fleet. Tautog (Blackfish) fishing on rocky structure, wrecks,
              and bridge pilings is excellent from April through June and again
              from October through December. Rhode Island{"'"}s Tautog
              regulations have supported a healthy fishery, and trophy-class
              fish over 10 pounds are caught regularly by skilled anglers using
              crab bait on jigs and bottom rigs.
            </p>
            <p>
              Sea Bass, Scup (Porgy), and Fluke are the primary summer bottom
              species, with boats drifting or anchoring over reef sites and
              wrecks in 30 to 100 feet of water. Cod fishing trips run during
              the winter months on deeper offshore structure, providing action
              during the colder season when most other species have migrated
              south.
            </p>
          </>
        ),
      },
      {
        heading: "Tuna, Sharks, and Offshore Action",
        body: (
          <>
            <p>
              Rhode Island{"'"}s proximity to deep water gives its fleet
              access to offshore species that many anglers do not associate
              with such a small state. Bluefin Tuna pass through Rhode Island
              Sound and the waters south of Block Island during the summer and
              fall, and some party boats offer targeted tuna trips when fish
              are in range. Mako Shark, Blue Shark, and Thresher Shark trips
              depart from Point Judith and Galilee during the warm months.
            </p>
            <p>
              The fall fishing season in Rhode Island is particularly exciting.
              False Albacore, Bonito, and Bluefish blitz through the rips
              around Block Island and along the Narragansett coast, and the
              Striped Bass migration brings big fish through on their way south.
              The combination of cool fall weather, aggressive fish, and
              beautiful coastal scenery makes autumn fishing in Rhode Island
              hard to beat.
            </p>
          </>
        ),
      },
    ],
  },

  "south-carolina": {
    sections: [
      {
        heading: "South Carolina's Lowcountry Fishing",
        body: (
          <>
            <p>
              South Carolina{"'"}s coast is defined by the Lowcountry, a
              landscape of tidal marshes, barrier islands, and winding creeks
              that transition into the open Atlantic. The warm waters of the
              South Atlantic support year-round fishing from ports like Myrtle
              Beach, Charleston, Hilton Head, and Georgetown. Party boats here
              have access to nearshore live-bottom reefs, offshore wrecks, and
              the Gulf Stream, which passes within 40 to 60 miles of shore
              during the summer months.
            </p>
            <p>
              The South Carolina coast sits in the South Atlantic Bight, a
              broad, shallow continental shelf that extends far offshore. The
              shelf{"'"}s live-bottom areas, where hard substrate supports
              coral and sponge growth, create natural fish habitat that holds
              Snapper, Grouper, and other reef species in good numbers. These
              live-bottom zones are the primary fishing grounds for most
              nearshore party boat trips.
            </p>
          </>
        ),
      },
      {
        heading: "Reef Fish, King Mackerel, and the Gulf Stream",
        body: (
          <>
            <p>
              Vermilion Snapper (locally called Beeliners), Black Sea Bass,
              Triggerfish, Porgy, and various Grouper species make up the core
              bottom-fishing catches on South Carolina party boats. These fish
              hold on ledges, artificial reefs, and natural hard-bottom areas
              in 60 to 140 feet of water. The catch limits and seasons for reef
              species are managed by the South Atlantic Fishery Management
              Council, and regulations are closely followed by all licensed
              party boats.
            </p>
            <p>
              King Mackerel are a major draw from late spring through fall,
              running along the coast in pursuit of baitfish schools. Trolling
              trips targeting Kings produce exciting surface strikes and fast
              fights on medium tackle. Spanish Mackerel, Cobia, and Barracuda
              are common bycatches on these runs.
            </p>
            <p>
              When the Gulf Stream swings close to shore during the warmer
              months, longer trips push offshore to target Mahi-Mahi, Wahoo,
              Yellowfin Tuna, and Sailfish. The warm, blue Gulf Stream water
              stands in sharp contrast to the greenish inshore water, and the
              color change often marks the beginning of pelagic fishing
              territory.
            </p>
          </>
        ),
      },
      {
        heading: "Myrtle Beach and the Grand Strand",
        body: (
          <>
            <p>
              Myrtle Beach and the Grand Strand are among the most popular
              vacation destinations on the East Coast, and fishing is a natural
              complement to the area{"'"}s beaches, golf courses, and
              entertainment. Party boats from Little River, Murrells Inlet, and
              the Myrtle Beach waterfront offer half-day and full-day trips that
              put visitors on productive fishing grounds within minutes of
              leaving the dock.
            </p>
            <p>
              The Grand Strand fishing scene caters to a mix of serious anglers
              and vacationing families who want a fun day on the water. Half-day
              trips are the most popular option and focus on nearshore reef
              fishing for Sea Bass, Snapper, and other bottom species. Full-day
              trips venture further offshore for larger fish and access to the
              Gulf Stream when it is within reach.
            </p>
          </>
        ),
      },
    ],
  },

  texas: {
    sections: [
      {
        heading: "Texas Gulf Coast Fishing",
        body: (
          <>
            <p>
              Texas has 367 miles of Gulf of Mexico coastline, and almost every
              stretch of it offers productive fishing. Party boats operate from
              major ports including Galveston, Port Aransas, South Padre Island,
              Freeport, and Port O{"'"}Connor, giving anglers access to fishing
              grounds that range from the shallow bays and jetties to deep
              offshore platforms and natural reef systems.
            </p>
            <p>
              The Texas party boat tradition is built around reef fishing over
              the oil and gas platforms that dot the Gulf. Like neighboring
              Louisiana, these platforms create artificial reef habitat that
              attracts enormous populations of game fish. The difference in
              Texas is the vast expanse of coast and the variety of
              environments, from the subtropical waters near the Mexican border
              to the Louisiana-influenced fisheries of the upper coast.
            </p>
          </>
        ),
      },
      {
        heading: "Red Snapper and the Rig Fishery",
        body: (
          <>
            <p>
              Red Snapper is the most anticipated catch on Texas party boats.
              The state has taken management of Red Snapper in state waters,
              which has resulted in extended seasons that give anglers far more
              days to target these popular reef fish than the short federal
              season allows. Texas Red Snapper have rebounded to historically
              high levels, and catching your limit on a party boat trip is a
              realistic expectation during open season.
            </p>
            <p>
              The oil platforms scattered across the Texas shelf create a
              network of fishing structure that extends from 30 to over 200
              miles offshore. Nearshore rigs in 60 to 100 feet of water hold
              Red Snapper, Lane Snapper, Vermilion Snapper, and Triggerfish.
              Deeper rigs produce larger Red Snapper, Greater Amberjack, Cobia,
              King Mackerel, and occasionally Yellowfin Tuna and Mahi-Mahi when
              blue water pushes close to the platforms.
            </p>
          </>
        ),
      },
      {
        heading: "Regional Fishing Highlights",
        body: (
          <>
            <p>
              <strong>Galveston and the Upper Coast</strong> is the most
              accessible fishing destination for the Houston metro area. Party
              boats here run to offshore rigs and the Flower Garden Banks
              National Marine Sanctuary, where crystal-clear water and healthy
              coral reefs support an incredible diversity of tropical fish
              species alongside the usual Gulf catches.
            </p>
            <p>
              <strong>Port Aransas</strong> on Mustang Island is the hub of
              the Texas party boat fleet, with a long history of head boat
              operations dating back decades. The deep jetties at Port Aransas
              are legendary fishing structure in their own right, and the
              offshore waters hold strong populations of Snapper, Grouper,
              Kingfish, and Ling.
            </p>
            <p>
              <strong>South Padre Island</strong> at the southern tip of Texas
              offers fishing in waters that are influenced by the warm currents
              sweeping north from Mexico. Tarpon, Snook, and other tropical
              species mix with the standard Gulf catches, giving South Padre a
              flavor that is distinct from the rest of the Texas coast.
            </p>
          </>
        ),
      },
      {
        heading: "Year-Round Gulf Fishing",
        body: (
          <>
            <p>
              Texas{"'"}s warm climate keeps party boats running year-round,
              though the peak season from April through October sees the most
              activity and the widest variety of species. Water temperatures in
              the Gulf off Texas range from the upper 50s in winter to the mid-
              80s in summer.
            </p>
            <p>
              Winter fishing in Texas focuses on Sheepshead, Black Drum, and
              the occasional Red Snapper trip when weather allows. Spring
              brings the return of King Mackerel, Cobia, and the opening of
              Snapper season. Summer is prime time for everything, and fall
              offers cooler temperatures with excellent offshore fishing before
              the fronts of winter start pushing through.
            </p>
          </>
        ),
      },
    ],
  },

  virginia: {
    sections: [
      {
        heading: "Virginia's Mid-Atlantic Fishing Grounds",
        body: (
          <>
            <p>
              Virginia sits at the midpoint of the Atlantic coast, straddling
              the transition zone between southern and northern marine
              ecosystems. The Chesapeake Bay, the largest estuary in North
              America, defines Virginia{"'"}s coastal geography and provides
              sheltered fishing grounds for a portion of the state{"'"}s party
              boat fleet. The Atlantic-facing coast at Virginia Beach gives
              access to offshore wrecks, artificial reefs, and the Norfolk
              Canyon, one of the most productive deep-water fishing areas on
              the East Coast.
            </p>
            <p>
              Party boats operating from Virginia Beach, Rudee Inlet, and the
              Chesapeake Bay Bridge-Tunnel area have an exceptional range of
              fishing options. The convergence of bay, coastal, and offshore
              environments within a small geographic area allows boats to adapt
              to conditions and target whatever species are most active on any
              given day.
            </p>
          </>
        ),
      },
      {
        heading: "The Chesapeake Bay Bridge-Tunnel",
        body: (
          <>
            <p>
              The Chesapeake Bay Bridge-Tunnel is one of the most unique fishing
              structures in the world. This 17.6-mile bridge and tunnel complex
              creates an artificial reef system at each of its four man-made
              islands, and the pilings, riprap, and tunnels attract a density
              of fish life that is difficult to find anywhere else on the coast.
              Tautog, Sheepshead, Flounder, Spadefish, Cobia, and Striped Bass
              all congregate around the structure at different times of the year.
            </p>
            <p>
              Party boats working the Bridge-Tunnel complex offer a fishing
              experience that is genuinely one of a kind. Anchoring near the
              rock islands and dropping jigs or bait into the shadow of the
              pilings produces steady action for species that use the structure
              as feeding stations. Spadefish fishing at the Bridge-Tunnel during
              June and July is a Virginia specialty that produces remarkable
              numbers of these disc-shaped fighters.
            </p>
          </>
        ),
      },
      {
        heading: "Offshore Virginia Beach",
        body: (
          <>
            <p>
              The waters off Virginia Beach drop into the Norfolk Canyon, where
              depths plunge from 600 to over 6,000 feet. This deep-water canyon
              is within overnight range of the party boat fleet and holds
              Yellowfin Tuna, Bigeye Tuna, Bluefin Tuna, Mahi-Mahi, Wahoo,
              White Marlin, and Blue Marlin. Virginia Beach{"'"}s offshore
              fishing season runs from May through October, with peak tuna
              action in the summer months.
            </p>
            <p>
              Nearshore wreck and reef fishing is strong year-round. Virginia
              {"'"}s artificial reef program has created productive bottom-
              fishing sites within a short run from Rudee Inlet, where Sea
              Bass, Tautog, Triggerfish, and Flounder hold on structure.
              Striped Bass fishing in the lower Chesapeake Bay and along the
              oceanfront is excellent from late fall through early spring,
              with trophy-class fish migrating through the area in predictable
              seasonal patterns.
            </p>
          </>
        ),
      },
    ],
  },

  washington: {
    sections: [
      {
        heading: "Fishing the Pacific Northwest",
        body: (
          <>
            <p>
              Washington State offers party boat fishing in two dramatically
              different marine environments: the sheltered inland waters of
              Puget Sound and the open Pacific Ocean along the rugged outer
              coast. This dual geography gives Washington anglers access to
              species ranging from Pacific Halibut and Lingcod to multiple
              species of Salmon and Rockfish, all set against a backdrop of
              snow-capped mountains, evergreen forests, and marine wildlife.
            </p>
            <p>
              Party boats and head boats in Washington operate from ports
              including Westport, Ilwaco, Seattle, Anacortes, and Bellingham.
              The inner and outer coast fisheries are managed separately, with
              different seasons, species, and regulations, giving anglers a
              reason to fish both environments over the course of a year.
            </p>
          </>
        ),
      },
      {
        heading: "Puget Sound Fishing",
        body: (
          <>
            <p>
              Puget Sound is a deep, cold-water fjord system that stretches
              over 100 miles from the Strait of Juan de Fuca to Olympia. The
              Sound{"'"}s underwater terrain features steep rock walls, gravel
              bars, kelp forests, and deep basins that support a rich ecosystem.
              Lingcod and various Rockfish species are the primary party boat
              targets in the Sound, with seasons typically opening in the spring
              and running through fall.
            </p>
            <p>
              Salmon fishing in Puget Sound targets Chinook (King), Coho
              (Silver), Pink, and Chum Salmon at different times of the year.
              The salmon runs that enter the Sound are among the most closely
              monitored and managed fisheries in the country, with season dates
              set based on run forecasts. When the fishing is open, the
              combination of reliable catches and the stunning scenery of the
              San Juan Islands and the Cascade Range makes Puget Sound salmon
              fishing an unforgettable experience.
            </p>
          </>
        ),
      },
      {
        heading: "Westport and the Outer Coast",
        body: (
          <>
            <p>
              Westport, on the southern Washington coast, is the primary
              departure point for ocean party boats. The town{"'"}s marina is
              home to a fleet of head boats that fish the productive waters of
              Grays Harbor and the Pacific for Halibut, Lingcod, Rockfish,
              and Salmon. Westport{"'"}s Halibut fishery is world-class, with
              fish commonly exceeding 30 pounds and trophy specimens over 100
              pounds landed every season.
            </p>
            <p>
              Albacore Tuna fishing is a unique Washington offering. When warm
              water pushes close to the coast during late summer and early fall,
              party boats make the run 30 to 60 miles offshore to intercept
              schools of Albacore. These fast, powerful fish travel in large
              schools, and when a school is located, the action can be nonstop
              for hours. Albacore Tuna are highly prized for their firm, light
              flesh and are a favorite for home canning.
            </p>
          </>
        ),
      },
      {
        heading: "Seasons and Weather on the Washington Coast",
        body: (
          <>
            <p>
              Washington{"'"}s fishing season is shorter than warm-water states,
              running primarily from April through October on the outer coast
              and extending slightly longer in the protected waters of Puget
              Sound. Weather is the biggest variable, as Pacific storms can
              produce large swells that close the bar at Westport and other
              coastal ports.
            </p>
            <p>
              Summer months offer the best combination of weather and fishing
              opportunity, with the longest days, warmest temperatures, and the
              most species available. Water temperatures on the Washington coast
              range from the mid-40s to the mid-50s, so warm, waterproof
              clothing is essential year-round. The trade-off for the cooler
              climate is fishing in waters that are lightly pressured compared
              to more popular coastal destinations, with catch rates that
              reflect the abundance of a healthy marine ecosystem.
            </p>
          </>
        ),
      },
    ],
  },
};
