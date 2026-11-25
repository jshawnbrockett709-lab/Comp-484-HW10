/* =====================================================================
   Giga Pet - Part 2: Chrome DevTools logging, errors and debugging

   I added a "DevTools Lab" panel to the page with buttons to track what is being pressed
   and to force some debug issues easily so I can screenshot it.
   ===================================================================== */

// Counts button presses so each logged action gets a number we can search for
var actionCount = 0;

// Styles for the custom (%c) console messages, in Old School RuneScape colours
var LOG_TAG_STYLE  = 'background:#2b2519; color:#ff981f; padding:2px 6px; border-radius:3px; font-weight:bold;';
var LOG_TEXT_STYLE = 'color:#0f9a0f; font-weight:bold;';
var LOG_WARN_STYLE = 'background:#ffff00; color:#000; padding:2px 6px;';

$(function() {
  logStartupBanner();
  buildLabPanel();
  watchGameActions();
});

// ---------------------------------------------------------------------
// PART 1
// ---------------------------------------------------------------------

// Log Custom: %c applies the CSS string that follows the text after it
function logStartupBanner() {
  console.log(
    '%cVarrock Animal Shelter%c DevTools lab loaded',
    LOG_TAG_STYLE,
    LOG_TEXT_STYLE
  );
}

// Log Info: console.info() and console.log() both show up under the "Info" level
function logInfoDemo() {
  console.info('[GigaPet] Info: you are looking after', pet_info.name);
  console.log('[GigaPet] Log: weight =', pet_info.weight, 'lb, happiness =', pet_info.happiness);
}

// Log Warning: yellow message for something that is not broken yet but needs attention
function logWarningDemo() {
  console.warn('[GigaPet] Warning: ' + pet_info.name + ' has ' + pet_info.energy + '/100 energy. Time for a nap?');
}

// Log Error: red message. Here a real error is caught and then reported.
function logErrorDemo() {
  try {
    JSON.parse('{ "name": "Hound", weight: 40 }');   // invalid JSON on purpose
  } catch (err) {
    console.error('[GigaPet] Error: could not read the pet data file.', err);
  }
}

// Log Table: shows an array of objects as a table (one row per pet)
function logTableDemo() {
  console.table(pets, ['name', 'weight', 'happiness', 'energy']);
}

// Log Group: groups related messages
function logGroupDemo() {
  console.group('[GigaPet] Pet report: ' + pet_info.name);
  console.log('Weight:', pet_info.weight);
  console.log('Happiness:', pet_info.happiness);

  console.group('Energy details');   // groups can be nested
  console.log('Energy:', pet_info.energy);
  console.log('Needs a nap:', pet_info.energy < 25);
  console.groupEnd();                // closes "Energy details"

  console.groupEnd();                // closes the pet report
}

// Log Custom: several %c sections in one message, each with its own CSS
function logCustomDemo() {
  console.log(
    '%c[GigaPet]%c ' + pet_info.name + ' %chappiness ' + pet_info.happiness,
    LOG_TAG_STYLE,
    'color:#ff981f; font-size:16px; font-weight:bold;',
    LOG_WARN_STYLE
  );
}

// ---------------------------------------------------------------------
// PART 2: MESSAGES THE BROWSER LOGS BY ITSELF
// ---------------------------------------------------------------------

// 404 Network Error: ask for files that do not exist. The browser logs the
// red "404 (Not Found)" messages

function trigger404Demo() {
  console.info('[GigaPet] Requesting files that do not exist...');

  // A missing image
  var missingImage = new Image();
  missingImage.src = 'images/missing-pet.png';

  // A missing data file requested with jQuery
  $.ajax({ url: 'data/pets.json', dataType: 'json' }).fail(function(xhr) {
    console.warn('[GigaPet] The pets.json request failed with status', xhr.status);
  });
}

// TypeError: there is no pet number 99, so pets[99] is undefined and
// reading .name from undefined throws. 
function triggerTypeErrorDemo() {
  var missingPet = pets[99];
  console.log('The missing pet is called', missingPet.name);
}

// Violation: a click handler that makes the page lag for a bit.

function triggerViolationDemo() {
  var start = Date.now();
  while (Date.now() - start < 3000) {
    // do nothing but wait: this freezes the page on purpose
  }
}

// ---------------------------------------------------------------------
// PART 4: 
// ---------------------------------------------------------------------
// Throwing a party should give the pet 3 rounds of bonus happiness:

function throwPartyDemo() {
  var rounds = 3;
  var bonus = 5;
  var happinessBefore = pet_info.happiness;

  for (var round = 1; round <= rounds; round++) {
    pet_info.happiness += bonus * round;
  }

  checkAndUpdatePetInfoInHtml();
  addChatLine('Game', 'The party should add ' + (bonus * 1 + bonus * 2 + bonus * 3) + ' tail wags to ' + pet_info.name + '.', 'game');
  addChatLine(pet_info.name, 'Happiness went from ' + happinessBefore + ' to ' + pet_info.happiness + '.', 'pet');
}

// ---------------------------------------------------------------------
// LOGGING EVERY GAME ACTION
// ---------------------------------------------------------------------
// Adds a second click handler to each existing game button. It runs after
// the handler in script.js, so the numbers it logs are the updated ones.
function watchGameActions() {
  var buttons = {
    '.treat-button': 'treat',
    '.play-button': 'play',
    '.exercise-button': 'exercise',
    '.nap-button': 'nap'
  };
  $.each(buttons, function(selector, actionName) {
    $(selector).click(function() {
      logGameAction(actionName);
    });
  });
}

function logGameAction(actionName) {
  actionCount++;
  console.info(
    '%c[GigaPet]%c Action #' + actionCount + ': ' + actionName +
      ' | ' + pet_info.name + ' | weight ' + pet_info.weight +
      ' | happiness ' + pet_info.happiness + ' | energy ' + pet_info.energy,
    LOG_TAG_STYLE,
    LOG_TEXT_STYLE
  );

  // Warn when the pet is nearly out of energy
  if (pet_info.energy < 25) {
    console.warn('[GigaPet] ' + pet_info.name + ' is low on energy (' + pet_info.energy + '/100).');
  }
  // Report an error when a stat has hit rock bottom
  if (pet_info.weight === 0 || pet_info.happiness === 0) {
    console.error('[GigaPet] ' + pet_info.name + ' is in trouble! weight=' + pet_info.weight + ', happiness=' + pet_info.happiness);
  }
}

// ---------------------------------------------------------------------
// THE DEVTOOLS LAB PANEL (buttons that run the demos above)
// ---------------------------------------------------------------------
function buildLabPanel() {
  var $panel = $('<section class="panel lab"></section>')
    .css({ maxWidth: '760px', margin: '12px auto 0' });

  addLabSection($panel, '1. Console methods', [
    ['Log Info', logInfoDemo],
    ['Log Warning', logWarningDemo],
    ['Log Error', logErrorDemo],
    ['Log Table', logTableDemo],
    ['Log Group', logGroupDemo],
    ['Log Custom', logCustomDemo]
  ]);

  addLabSection($panel, '2. Browser-logged messages', [
    ['404 Error', trigger404Demo],
    ['TypeError', triggerTypeErrorDemo],
    ['Violation', triggerViolationDemo]
  ]);

  addLabSection($panel, '4. Debugging practice', [
    ['Throw Party', throwPartyDemo]
  ]);

  $('.chatbox').after($panel);
}

// Adds a heading and a grid of buttons to the lab panel
function addLabSection($panel, title, buttons) {
  $panel.append($('<div class="stat-row"></div>').text(title));
  var $grid = $('<div class="button-container"></div>').css('margin-top', '8px');
  $.each(buttons, function(i, item) {
    $('<button></button>').text(item[0]).click(item[1]).appendTo($grid);
  });
  $panel.append($grid);
}
