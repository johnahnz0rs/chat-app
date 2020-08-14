const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

// goal: add timestamps for location messages
// 1. create generateLocationMessage and export
//      - { url: '', createdAt: 0 }
// 2. use generatedLocationMessage when server emits locationMessage
// 3. update template to render time before the url
// 4. compile the template with the url and the formatted time
// 5. test your work!
const generateLocationMessage = (username, coords) => {
    return {
        username,
        url: `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage
}
