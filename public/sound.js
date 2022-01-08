const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
let click_val = false;


recognition.onstart = function() {
    console.log('voice is activated, you can use microphone');
};

recognition.onresult = function(event) {
    const current = event.resultIndex;

    const note = event.results[current][0].transcript;
    const textarea = document.getElementById('addTxt');
    textarea.innerText += note;
    recognition.stop();
    click_val = false;
}

let voiceCommand = document.getElementById('voiceNote');
voiceCommand.addEventListener('click', (e) => {
    e.preventDefault();
    console.log("Starting recognition")
    recognition.start();
});

// module.exports = speech;