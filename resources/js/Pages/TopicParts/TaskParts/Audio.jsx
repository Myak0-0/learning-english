const Audio = ({ block, command: handleTheoryAudioPlay }) => {    
    return (
        <div key={block.id} className="audio-player-wrapper">
            <audio controls src={`/stream-audio/${block.content}`} onPlay={handleTheoryAudioPlay} controlsList="nodownload" ></audio>
        </div>
    )
}

export default Audio;
