const Image = ({ block }) => {
    return (
        <img key={block.id} src={`/images/theory/${block.content.content}`} alt="Theory" className="image" />
    )
}

export default Image;
