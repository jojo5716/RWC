/*!
 * calendars.js v0.0.1
 * Autor: Jonathan Rodriguez.
 *
 * Freely distributable under the MIT license.
 *
 * Full details and documentation:
 */

(function(root, undefined) {
    var lib = {};

    // Current version
    lib.version = '0.0.1';

    var cal_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var cal_months_labels =['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];
    var cal_days_labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    lib.last_date_created = '';
    // Default settings
    lib.settings = {
       calendar_container: 'calendar_responsive', // Where the calendar initializes
       checkin_date: Date.now(),
       months_before: 0, //Number of months before the current
       months_after: 6, //Number of months after the current
       start_date: '', //Selected default date (if is empty we'll understand it's a today)
       cal_days_in_month: cal_days_in_month,
       cal_months_labels: cal_months_labels,
       cal_days_labels: cal_days_labels
    };

    // Public methods
    lib.startCalendar = function(args){
        if(args != undefined){
            lib._extendSettings(args);
        }
        var html_calendars = '';
        lib.settings.start_date = lib.settings.start_date || lib._getStringDate(); // 04/11/2016
        var start_date = lib.settings.start_date;

        if(!lib.isValidDate(start_date)){
             throw 'Invalid date: (' + start_date + ')';
        }

        var months_to_show = lib.settings.months_before + lib.settings.months_after; // number of months to load in the element
        var months_before = lib.settings.months_before;
        var months_after = lib.settings.months_after;

        for(var i = 0; i <= months_to_show; i++){
            var apply_months = ((months_before > 0 && i < months_before) ?  i - months_before : (months_before > 0) ? i - months_after:  i);
            var current_date = lib.changeDate(start_date, apply_months);

            lib.last_date_created = current_date;

            html_calendars += lib.createCalendar(current_date);

        }

        var $calendar = document.getElementById(lib.settings.calendar_container);

        if(!$calendar){
            throw 'Container ID: (' + lib.settings.calendar_container + ') not found';
        }

        $calendar.innerHTML = html_calendars;

        lib._setListenersDay();
        lib._setListenersScroll();
    };

    lib.createCalendar = function(string_date){
        if(!string_date){
            return ''
        }

        var html = '';
        var [mm, dd, yyyy] = lib._numbersDate(string_date);

        var firstDay = new Date(yyyy, mm, 1);
        var startingDay = firstDay.getDay();
        var monthLength = lib.settings.cal_days_in_month[mm - 1];
        var day_number = 0;
        // Just Febrary
        if (mm == 1){
            if((yyyy % 4 == 0 && yyyy % 100 != 0) || yyyy % 400 == 0){
                monthLength = 29;
            }
        }

        var monthName = lib.settings.cal_months_labels[mm - 1];
        html += '<div class="calendar"><div class="calendar-header">' + monthName + " " + yyyy + '</div><div class="calendar-header-days">';
        for(var i = 0; i <= 6; i++ ){
            html += '<span class="calendar-header-day">' + lib.settings.cal_days_labels[i] + '</span>';
        }

        html += '</div><div class="calendar-days">';
        // Empty days on the begining month
        for (var i = 0; i < startingDay; i++){
            html += '<span class="calendar-day"></span>';
        }


        var day = 1;
        // Creating days
        for (var i = 0; i < monthLength; i++){
            // Posición del día en el calendario
            day_number += 1;

            // Estructura HTML del día
            html += '<span data-day="' + day_number+
                        '"data-month="' + mm +
                        '" data-year="' + yyyy +
                        '" class="calendar-day">' + day +
                    '</span>';

            day++;
        }

        html += '</div></div>';

        return html
    }

    // Internal methods
    lib._extendSettings = function(args){
        for(var key in args){
            if(lib.settings.hasOwnProperty(key))
                lib.settings[key] = args[key];
        }
    }

    lib._getStringDate = function(date){
        if(!date){
            date = new Date();
        }

        var dd = date.getDate();
        var mm = date.getMonth();
        dd = (dd < 10) ? '0' + dd : dd;
        mm = (mm < 10) ? '0' + mm : mm;
        var yyyy = date.getFullYear();

        return mm + '/' + dd + '/' + yyyy;
    }

    lib.isValidDate = function(date){
        var [mm, dd, yyyy] = lib._numbersDate(date);

        if(!mm|| !dd || !yyyy){
            return false
        }

        return true;
    }

    lib._numbersDate = function(string_date){
        if(typeof string_date === 'string'){
            var [mm, dd, yyyy] = string_date.split("/");
        }else if(typeof string_date === 'object'){
            var mm = string_date.getDate();
            var dd = string_date.getMonth();
            var yyyy = string_date.getFullYear();
        }
        return [parseInt(mm), parseInt(dd), parseInt(yyyy)];
    }

    lib.changeDate = function(date, apply_months){
        var [mm, dd, yyyy] = lib._numbersDate(date);

        mm = mm + apply_months;

        if(mm <= 0){
            mm = (12 + apply_months) + 1;
            yyyy = yyyy - 1;
        }else if(mm > 12){
            mm = apply_months;
            yyyy = yyyy + 1;
        }

        dd = (dd < 10) ? '0' + dd : dd;
        mm = (mm < 10) ? '0' + mm : mm;


        return mm + '/' + dd + '/' + yyyy;
    }

    lib._setListenersDay = function(){
        var listener_element = "#" + lib.settings.calendar_container + " span.calendar-day";
        var days_length = document.querySelectorAll(listener_element).length;
        for(let i = 0; i < days_length; i++){
            var calendar_day = document.querySelectorAll(listener_element)[i];
            calendar_day.onclick = function(e){
                console.log(this);
            }
        }
    }

    lib._setListenersScroll = function(){
        var $calendars_container = document.getElementById(lib.settings.calendar_container);
        $calendars_container.scrollTop = 10;
        $calendars_container.addEventListener("scroll", function (event) {

            if($calendars_container.scrollHeight - $calendars_container.scrollTop === $calendars_container.clientHeight){

                var last_position = $calendars_container.scrollTop;

                for(var i = 1; i<= lib.settings.months_before + 1; i++){
                    var new_date = lib.changeDate(lib.last_date_created, 1);
                    lib.last_date_created = new_date;
                    document.getElementById(lib.settings.calendar_container).innerHTML += lib.createCalendar(new_date);
                }

            $calendars_container.scrollTop = last_position;

            }else if($calendars_container.scrollTop == 0){
               var $first_calendar = $calendars_container.getElementsByClassName("calendar")[0];
                for(var i = 1; i<= lib.settings.months_before + 1; i++){
                    var new_date = lib.changeDate(lib.settings.start_date, -1);
                    lib.settings.start_date = new_date;

                    var current_html = $calendars_container.innerHTML;
                    $calendars_container.innerHTML = lib.createCalendar(new_date) + current_html;

                }
                if($calendars_container.scrollTop == 0)
                    $calendars_container.scrollTop = $first_calendar.scrollHeight + 2;
            }
            lib._setListenersDay();
        });
    }
    // Exports methods
    root['calendar_responsive'] = lib;
// Root will be `window` in browser
}(this));
