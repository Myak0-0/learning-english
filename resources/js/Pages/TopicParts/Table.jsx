const Table = ({ block, command: formatTheoryText}) => {
    return (
        <div key={block.id} className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        {block.content.head && block.content.head.map((head, i) => (
                            <th key={i}>{formatTheoryText(head)}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {block.content.columns && block.content.columns.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex}>{formatTheoryText(cell)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Table;
