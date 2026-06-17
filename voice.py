import whisper
import sounddevice as sd
import numpy as np
import scipy.io.wavfile as wav
import tempfile
import os

# Load whisper model
print("Loading voice model...")
model = whisper.load_model("tiny")
print("Voice model ready!")

def record_audio(seconds=5, sample_rate=16000):
    print(f"Recording for {seconds} seconds... Speak now!")
    audio = sd.rec(
        int(seconds * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype=np.int16
    )
    sd.wait()
    print("Recording done!")
    return audio, sample_rate

def transcribe_audio(audio, sample_rate):
    # Save to temp file
    temp_file = tempfile.mktemp(suffix=".wav")
    wav.write(temp_file, sample_rate, audio)
    
    # Transcribe
    result = model.transcribe(temp_file)
    os.remove(temp_file)
    return result["text"]

if __name__ == "__main__":
    print("=" * 40)
    print("Voice Test")
    print("=" * 40)
    audio, sr = record_audio(seconds=5)
    text = transcribe_audio(audio, sr)
    print(f"You said: {text}")