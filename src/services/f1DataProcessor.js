import { getCircuitLocation, getCircuitCoordinates } from "../utils/circuitHelpers";

export const filterEventResponse = (response, circuitOutlineMap = {}) => {
  const groupedCompetitions = [];

  response.forEach((event) => {
    // Skip certain event types
    if (
      event.type === "2nd Qualifying" ||
      event.type === "3rd Qualifying" ||
      event.type === "2nd Sprint Shootout" ||
      event.type === "3rd Sprint Shootout"
    ) {
      return;
    } else if (event.type === "1st Qualifying") {
      event.type = "Qualifying";
    } else if (event.type === "1st Sprint Shootout") {
      event.type = "Sprint Shootout";
    }

    const id = event.competition.id;
    const existingCompetition = groupedCompetitions.find(
      (comp) => comp.id === id
    );

    const circuitName = event.circuit.name;
    const circuitKey = circuitName.toLowerCase().replace(/\s+/g, "_");
    const customCircuitImage = circuitOutlineMap[circuitKey];

    // Get city from circuit name
    const circuitLocation = getCircuitLocation(circuitName);
    const city = circuitLocation?.city || null;

    // Get coordinates using city and circuit name
    const coordinates = city ? getCircuitCoordinates(city, circuitName) : null;

    if (existingCompetition) {
      existingCompetition.events.push(event);
      if (event.type === "Race") {
        existingCompetition.status = event.status;
      }
    } else {
      groupedCompetitions.push({
        status: event.type === "Race" ? event.status : "Scheduled",
        id,
        name: event.competition.name,
        country: event.competition.location.country,
        circuitImage: customCircuitImage || event.circuit.image,
        circuitName,
        city: city,
        coordinates: coordinates,
        events: [event],
      });
    }
  });

  return groupedCompetitions;
};

export const filterDriverResponse = (
  response,
  driverPhotoMap = {},
  teamBadgeMap = {}
) => {
  const teamMap = {
    "Red Bull Racing": "Red Bull",
    "McLaren Racing": "McLaren",
    "Scuderia Ferrari": "Ferrari",
    "Scuderia Ferrari\n": "Ferrari",
    "Mercedes-AMG Petronas": "Mercedes",
    "Aston Martin F1 Team": "Aston Martin",
    "Haas F1 Team": "Haas",
    "Racing Bulls": "Racing Bulls",
    "Alpine F1 Team": "Alpine",
    "Williams F1 Team": "Williams",
    "Sauber F1 Team": "Stake",
    "Stake F1 Team Kick Sauber": "Sauber",
  };

  return response.map((driver) => {
    const spaceIndex = driver.driver.name.indexOf(" ");
    const firstName = driver.driver.name.substring(0, spaceIndex);
    const lastName = driver.driver.name.substring(spaceIndex + 1);
    const abbr = driver.driver.abbr || lastName.substring(0, 3).toUpperCase();

    const driverKey = `${firstName
      .toLowerCase()
      .replace(/\s+/g, "_")}_${lastName.toLowerCase().replace(/\s+/g, "_")}`;

    const mappedTeam = teamMap[driver.team.name] || driver.team;

    return {
      id: driver.driver.id,
      firstName,
      lastName,
      abbr,
      team: driver.team.name,
      teamBadge: teamBadgeMap[mappedTeam] || driver.team.logo,
      number: driver.driver.number,
      image: driverPhotoMap[driverKey] || driver.driver.image,
    };
  });
};

export const filterNextEvent = (seasonData) => {
  const scheduledEvent = seasonData.find(
    (event) => event.status === "Scheduled"
  );
  return scheduledEvent || null;
};

export const filterPreviousEvent = (seasonData) => {
  for (let i = seasonData.length - 1; i >= 0; i--) {
    if (seasonData[i].status === "Completed") {
      return seasonData[i];
    }
  }
  return null;
};

export const filterLiveEvent = (seasonData) => {
  let liveEvent = null;
  const tenMinutesInMillis = 10 * 60 * 1000;

  for (const circuitEvent of seasonData) {
    const liveEventInCircuit = circuitEvent.events.find(
      (event) => event.status === "Live"
    );

    if (liveEventInCircuit) {
      liveEvent = liveEventInCircuit;
      break;
    } else {
      const currentTime = Date.now();
      const tenMinutesAgo = currentTime - tenMinutesInMillis;
      const liveRace = circuitEvent.events.find(
        (event) =>
          new Date(event.date).getTime() <= currentTime &&
          new Date(event.date).getTime() >= tenMinutesAgo
      );

      if (liveRace) {
        liveEvent = liveRace;
      }
    }
  }

  return liveEvent;
};

export const filterUpcomingEvents = (seasonData) => {
  return seasonData.filter((event) => event.status === "Scheduled");
};

export const filterPreviousEvents = (seasonData) => {
  return seasonData.filter((event) => event.status === "Completed");
};

export const getRoundNumber = (response) => {
  const uniqueEvents = Array.from(
    new Set(response.map((event) => event.circuitName))
  ).map((circuitName) =>
    response.find((event) => event.circuitName === circuitName)
  );

  const scheduledEventIndex = uniqueEvents.findIndex(
    (event) => event.status === "Scheduled"
  );

  return scheduledEventIndex !== -1 ? scheduledEventIndex + 1 : null;
};

