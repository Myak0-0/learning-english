const Title = ({ block, command: formatTheoryText }) => {
    return (
        <h2 key={block.id} className="title">{formatTheoryText(block.content.content)}</h2>
    )
}

export default Title;
