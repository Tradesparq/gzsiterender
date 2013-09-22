/**
 * This is a ko ui datepicker.
 * 
 * http://stackoverflow.com/questions/11121960/bootstrap-datepicker-with-knockout-js-databind
 * 
 * @depend 
 * 		bootstrap-datepicker.js
 * 		datepicker.css
 * 
 * 
 * @author KEVIN
 */
ko.bindingHandlers.datepicker = {
    init: function(element, valueAccessor, allBindingsAccessor) {
      //initialize datepicker with some optional options
      var options = allBindingsAccessor().datepickerOptions || {};
      $(element).datepicker(options);

      //when a user changes the date, update the view model
      ko.utils.registerEventHandler(element, "changeDate", function(event) {
             var value = valueAccessor();
             if (ko.isObservable(value)) {
                 value(event.date);
             }                
      });
    },
    update: function(element, valueAccessor)   {
        var widget = $(element).data("datepicker");
         //when the view model is updated, update the widget
        if (widget) {
            widget.date = ko.utils.unwrapObservable(valueAccessor());
            if (widget.date) {
                widget.setValue();            
            }
        }
    }
};