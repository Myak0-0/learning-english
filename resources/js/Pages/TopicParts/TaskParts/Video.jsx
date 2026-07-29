const Video = ({ block }) => {    
    return (
        <div key={block.id} className="video-wrapper">
            <iframe src={block.content} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
        </div>
    )
}

export default Video;
