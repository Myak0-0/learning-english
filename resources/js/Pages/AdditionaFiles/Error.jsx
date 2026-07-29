
const Error = ({text, type = 0}) => {
    return (
        <div className={`error-message ${text ? 'visible' : ''} ${type == 1 ? 'not-mistake' : ''}`}>
            {text}
        </div>
    );
}

export default Error;