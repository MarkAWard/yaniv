let gameScore = null;
let numPlayers = null;
let scores = {};
let asafs = {};
let yanivs = {};
let OUT = "OUT";

function setupGame(e) {
    var scoreInput = document.getElementById('game-to');
    var numPlayersInput = document.getElementById('num-players');
    gameScore = parseInt(scoreInput.value || scoreInput.placeholder);
    numPlayers = parseInt(numPlayersInput.value || numPlayersInput.placeholder);
    document.getElementById("game-score").textContent = 'Game to ' + gameScore;
    createPlayerHeader();
    document.getElementById("scorecard").style.display = null;
    document.getElementById("game-setup").style.display = 'none';
}

function createPlayerHeader() {
    var snames = document.getElementsByClassName('score-names')[0];
    var stotal = document.getElementsByClassName('score-total')[0];
    var sbehind = document.getElementsByClassName('score-behind')[0];
    var sasafs = document.getElementsByClassName('score-asafs')[0];
    var syanivs = document.getElementsByClassName('score-yanivs')[0];
    var cell = null;
    for (let player = 1; player <= numPlayers; player++) {
        cell = document.createElement("th");
        cell.setAttribute("class", "player" + player);
        cell.setAttribute("contenteditable", "true");
        cell.textContent = "Player " + player;
        snames.appendChild(cell);
        
        cell = document.createElement("th");
        cell.setAttribute("class", "player" + player);
        cell.textContent = 0;
        stotal.appendChild(cell);
        
        cell = document.createElement("th");
        cell.setAttribute("class", "player" + player);
        cell.textContent = 0;
        sbehind.appendChild(cell);

        cell = document.createElement("th");
        cell.setAttribute("class", "player" + player);
        cell.textContent = 0;
        sasafs.appendChild(cell);

        cell = document.createElement("th");
        cell.setAttribute("class", "player" + player);
        cell.textContent = 0;
        syanivs.appendChild(cell);
    }
}

function update(e) {
    sumScores();
    updateTotals();
    updateBehind();
    updateYanivs();
    updateAsafs();
};

function addRow() {
    console.log("CLICK add scores");
    var scoresRef = document.getElementsByTagName("tbody")[0];
    var N = scoresRef.getElementsByTagName("tr").length;
    var newRow = scoresRef.insertRow(N-1);
    newRow.insertCell().textContent = "Round " + N;
    for (let index = 1; index <= numPlayers; index++) {
        var c = newRow.insertCell();
        c.setAttribute("contenteditable", "true");
        c.setAttribute("class", "player" + index);
        c.addEventListener("blur", update);
        if (scores[index] >= gameScore) {
            c.textContent = OUT;
            c.style.backgroundColor = 'rgb(255, 0, 0, .7)';
            c.setAttribute("contenteditable", "false");
        }
    }
    document.getElementById("add-row").scrollIntoView();
};

function scorecardScores() {
    return document.getElementsByTagName("tbody")[0]
}

function getRow(i) {
    var scoresRef = scorecardScores();
    return Array.from(
            scoresRef.getElementsByTagName("tr")[i].getElementsByTagName("td")
        ).slice(1).map(x => parseInt(x.textContent))
}

function getColumn(i) {
    var scoresRef = scorecardScores();
    return Array.from(
            scoresRef.getElementsByClassName("player" + i)
        ).map(x => x.textContent)
}

function sumScores() {
    for (let player = 1; player <= numPlayers; player++) {
        var pscores = getColumn(player);
        var ptotal = 0;
        var pasafs = 0;
        var pyanivs = 0;
        for (const idx in pscores) {
            var row = getRow(idx);
            var val = row[player-1]
            if (pscores[idx] == OUT || isNaN(val)) { continue; }
            if (val == 0) { pyanivs++; }
            if (val >= 30 && !row.includes(0)) { pasafs++; }
            ptotal += val;
            if (ptotal > 50 && ptotal % 50 == 0) { ptotal -= 50; }
        }
        scores[player] = ptotal;
        yanivs[player] = pyanivs;
        asafs[player] = pasafs;
    }
}

function scorecardTopSection(name) {
    return document.getElementsByTagName("thead")[0].getElementsByClassName("score-"+name)[0]
}

function updateTotals() {
    var scoresRef = scorecardTopSection("total");
    for (let index = 1; index <= numPlayers; index++) {
        var c = scoresRef.getElementsByClassName("player" + index)[0];
        c.textContent = scores[index];
        c.style.backgroundColor = scoreColor(scores[index]);
    }
}

function updateBehind() {
    var scoresRef = scorecardTopSection("behind");
    const minscore = Math.min(...Object.values(scores));
    for (let index = 1; index <= numPlayers; index++) {
        var c = scoresRef.getElementsByClassName("player" + index)[0];
        c.textContent = scores[index] - minscore;
    }
}

function updateYanivs() {
    var scoresRef = scorecardTopSection("yanivs");
    for (let index = 1; index <= numPlayers; index++) {
        var c = scoresRef.getElementsByClassName("player" + index)[0];
        c.textContent = yanivs[index];
    }
}

function updateAsafs() {
    var scoresRef = scorecardTopSection("asafs");
    for (let index = 1; index <= numPlayers; index++) {
        var c = scoresRef.getElementsByClassName("player" + index)[0];
        c.textContent = asafs[index];
    }
}

function distanceToOut(val) {
    var m = Math.min(0.95 * gameScore, Math.min(...Object.values(scores)))
    return (val - m) / (gameScore - m)
}

function pickColor(weight) {
    var w = Math.pow(weight * 2 - 1, 3);
    var w1 = Math.min(1, w + 1);
    var w2 = Math.min(1, -1 * w + 1);
    var rgb = [
        Math.round(250 * w1),
        Math.round(250 * w2),
        0
    ];
    return rgb;
}

function scoreColor(val) {
    var result = pickColor(distanceToOut(val));
    return 'rgb(' + result.join() + ')';
}

// $('td[contenteditable=true]').on('focus', function() {
//     console.log("focus");
//     const $this = $(this);
//     $this.data('before', $this.html());
// }).on('blur keyup paste input', function() {
//     console.log("other");
//     const $this = $(this);
//     if ($this.data('before') !== $this.html()) {
//         $this.data('before', $this.html());
//         $this.trigger('change');
//     }
//     else {
//         console.log("NO change");
//     }
// }).on('change', function() {
//     console.log("CHANGE");
// });


// (function($, window, document, undefined) {
//     var pluginName = "editable",
//       defaults = {
//         keyboard: true,
//         dblclick: true,
//         button: true,
//         buttonSelector: ".edit",
//         maintainWidth: true,
//         dropdowns: {},
//         edit: function() {},
//         save: function() {},
//         cancel: function() {}
//       };
  
//     function editable(element, options) {
//       this.element = element;
//       this.options = $.extend({}, defaults, options);
  
//       this._defaults = defaults;
//       this._name = pluginName;
  
//       this.init();
//     }
  
//     editable.prototype = {
//       init: function() {
//         this.editing = false;
  
//         if (this.options.dblclick) {
//           $(this.element)
//             .css('cursor', 'pointer')
//             .bind('dblclick', this.toggle.bind(this));
//         }
  
//         if (this.options.button) {
//           $(this.options.buttonSelector, this.element)
//             .bind('click', this.toggle.bind(this));
//         }
//       },
  
//       toggle: function(e) {
//         e.preventDefault();
  
//         this.editing = !this.editing;
  
//         if (this.editing) {
//           this.edit();
//         } else {
//           this.save();
//         }
//       },
  
//       edit: function() {
//         var instance = this,
//           values = {};
  
//         $('td[data-field]', this.element).each(function() {
//           var input,
//             field = $(this).data('field'),
//             value = $(this).text(),
//             width = $(this).width();
  
//           values[field] = value;
  
//           $(this).empty();
  
//           if (instance.options.maintainWidth) {
//             $(this).width(width);
//           }
  
//           if (field in instance.options.dropdowns) {
//             input = $('<select></select>');
  
//             for (var i = 0; i < instance.options.dropdowns[field].length; i++) {
//               $('<option></option>')
//                 .text(instance.options.dropdowns[field][i])
//                 .appendTo(input);
//             };
  
//             input.val(value)
//               .data('old-value', value)
//               .dblclick(instance._captureEvent);
//           } else {
//             input = $('<input type="text" />')
//               .val(value)
//               .data('old-value', value)
//               .dblclick(instance._captureEvent);
//           }
  
//           input.appendTo(this);
  
//           if (instance.options.keyboard) {
//             input.keydown(instance._captureKey.bind(instance));
//           }
//         });
  
//         this.options.edit.bind(this.element)(values);
//       },
  
//       save: function() {
//         var instance = this,
//           values = {};
  
//         $('td[data-field]', this.element).each(function() {
//           var value = $(':input', this).val();
  
//           values[$(this).data('field')] = value;
  
//           $(this).empty()
//             .text(value);
//         });
  
//         this.options.save.bind(this.element)(values);
//       },
  
//       cancel: function() {
//         var instance = this,
//           values = {};
  
//         $('td[data-field]', this.element).each(function() {
//           var value = $(':input', this).data('old-value');
  
//           values[$(this).data('field')] = value;
  
//           $(this).empty()
//             .text(value);
//         });
  
//         this.options.cancel.bind(this.element)(values);
//       },
  
//       _captureEvent: function(e) {
//         e.stopPropagation();
//       },
  
//       _captureKey: function(e) {
//         if (e.which === 13) {
//           this.editing = false;
//           this.save();
//         } else if (e.which === 27) {
//           this.editing = false;
//           this.cancel();
//         }
//       }
//     };
  
//     $.fn[pluginName] = function(options) {
//       return this.each(function() {
//         if (!$.data(this, "plugin_" + pluginName)) {
//           $.data(this, "plugin_" + pluginName,
//             new editable(this, options));
//         }
//       });
//     };
  
//   })(jQuery, window, document);
  
//   editTable();
  
//   //custome editable starts
//   function editTable(){
    
//     $(function() {
//     var pickers = {};
  
//     $('table tr').editable({
//       dropdowns: {
//         sex: ['Male', 'Female']
//       },
//       edit: function(values) {
//         $(".edit i", this)
//           .removeClass('fa-pencil')
//           .addClass('fa-save')
//           .attr('title', 'Save');
  
//         pickers[this] = new Pikaday({
//           field: $("td[data-field=birthday] input", this)[0],
//           format: 'MMM D, YYYY'
//         });
//       },
//       save: function(values) {
//         $(".edit i", this)
//           .removeClass('fa-save')
//           .addClass('fa-pencil')
//           .attr('title', 'Edit');
  
//         if (this in pickers) {
//           pickers[this].destroy();
//           delete pickers[this];
//         }
//       },
//       cancel: function(values) {
//         $(".edit i", this)
//           .removeClass('fa-save')
//           .addClass('fa-pencil')
//           .attr('title', 'Edit');
  
//         if (this in pickers) {
//           pickers[this].destroy();
//           delete pickers[this];
//         }
//       }
//     });
//   });
    
//   }
  
//   $(".add-row").click(function(){
//     $("#editableTable").find("tbody tr:first").before("<tr><td data-field='name'></td><td data-field='name'></td><td data-field='name'></td><td data-field='name'></td><td><a class='button button-small edit' title='Edit'><i class='fa fa-pencil'></i></a> <a class='button button-small' title='Delete'><i class='fa fa-trash'></i></a></td></tr>");   
//     editTable();  
//     setTimeout(function(){   
//       $("#editableTable").find("tbody tr:first td:last a[title='Edit']").click(); 
//     }, 200); 
    
//     setTimeout(function(){ 
//       $("#editableTable").find("tbody tr:first td:first input[type='text']").focus();
//         }, 300); 
    
//      $("#editableTable").find("a[title='Delete']").unbind('click').click(function(e){
//           $(this).closest("tr").remove();
//       });
     
//   });
  
//   function myFunction() {
      
//   }
  
//   $("#editableTable").find("a[title='Delete']").click(function(e){  
//     var x;
//       if (confirm("Are you sure you want to delete entire row?") == true) {
//           $(this).closest("tr").remove();
//       } else {
          
//       }     
//   });
  

