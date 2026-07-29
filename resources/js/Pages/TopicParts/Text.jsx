const Text = ({ block, command: formatTheoryText }) => {
    return (
        <p key={block.id} className="text">{formatTheoryText(block.content.content)}</p>
    )
}

export default Text;
