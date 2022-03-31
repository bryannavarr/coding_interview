const events = require("./events.json");
const users = require("./users.json");

/* Utility Functions */

const parseDate = (date) => date.slice(0, 10);

const parseTime = (date) => date.slice(11);

/**
 * @function filterUsersAndEvents | takes node arguments and filters users and their respective events
 *@param {array} | array of names arguments or 'all'
 */

const filterUsersAndEvents = (namesList) => {
  let targetUsers;
  if (namesList[0] !== "all") {
    namesList = namesList[0].split(",");
    targetUsers = users.filter((value) => namesList.indexOf(value.name) !== -1);
  } else {
    targetUsers = users;
  }

  let targetEvents = events.filter((each) => {
    return targetUsers.some((val) => {
      return each.user_id === val.id;
    });
  });

  targetEvents.sort(function (a, b) {
    return a.start_time.localeCompare(b.start_time);
  });
  return organizeByDay(targetEvents);
};

/**
 * @function organizeByDay | takes @param sortedEvents creates a 2d array to separate events by day
 *@param {array} | array of sorted events in ascending order from events.json
 */

const organizeByDay = (sortedEvents) => {
  let i, event;
  let resultIndex = 0;
  let result = [[sortedEvents[0]]];
  let lastDay = parseDate(sortedEvents[0].start_time);
  for (i = 1; i < sortedEvents.length; i++) {
    event = sortedEvents[i];
    if (event.start_time.includes(lastDay)) {
      result[resultIndex].push(event);
    } else {
      result.push([event]);
      lastDay = parseDate(event.start_time);
      resultIndex++;
    }
  }
  return result;
};

/**
 * @function findAvailableTimes | takes events by day and iterates to find find free time for each day event
 *@param {array} | array of events
 */

const findAvailableTimes = (filteredEvents) => {
  let startTime = "13:00:00";
  let endTime = "21:00:00";
  let availableTimes = [];
  let currentDay = parseDate(filteredEvents[0].start_time);
  let startOfDay = currentDay + "T" + startTime;
  let endOfDay = currentDay + "T" + endTime;

  let currentTime = startOfDay;

  let i;
  for (i = 0; i < filteredEvents.length; i++) {
    let { start_time, end_time } = filteredEvents[i];
    if (currentTime == endOfDay) break;

    if (currentTime < start_time) {
      availableTimes.push({
        start_time: currentTime,
        end_time: start_time,
      });
    }
    if (currentTime < end_time) currentTime = end_time;
    if (i === filteredEvents.length - 1 && currentTime < endOfDay) {
      availableTimes.push({
        start_time: currentTime,
        end_time: endOfDay,
      });
    }
  }
  return availableTimes;
};

/**
 * @function printFreeTimes | prints available times to the console in the requested format
 *@param {array} | array of times and days
 */

const printFreeTimes = (openTimes) => {
  const format = (time) => {
    return `${parseDate(time.start_time)} ${parseTime(
      time.start_time
    )} - ${parseTime(time.end_time)}`;
  };

  console.log("All Available Slots::");
  console.log("==============================");

  openTimes.forEach((value) => {
    if (value.length > 0) {
      value.forEach((time) => {
        console.log(format(time));
      });
    }
    console.log("==============================");
  });
};

/**
 * @function findAvailableTimesAmongUsers | main function that takes node arguments, filters, finds times, and prints times
 */

findAvailableTimesAmongUsers = () => {
  let namesList = process.argv.slice(2);
  const events = filterUsersAndEvents(namesList);
  const openTimeSlots = events.map((eventsByDay) =>
    findAvailableTimes(eventsByDay)
  );
  printFreeTimes(openTimeSlots);
};

/**
 * @function init | main function that is called on node script initialization
 */

init = () => {
  findAvailableTimesAmongUsers();
};

init();
