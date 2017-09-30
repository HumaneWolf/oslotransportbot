module.exports = {
    log: function(input) {
        console.log('INFO:    ' + input);
    },

    warn: function(input) {
        console.log('WARN:    ' + input);
    },

    error: function(input) {
        console.log('ERROR:   ' + input);
    }
};