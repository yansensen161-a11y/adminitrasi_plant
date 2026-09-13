export default function ApplicationLogo(props) {
    return (
        <img 
            {...props}
            src="/images/planner_logo.jpg" 
            alt="Planner Logo" 
            className={`rounded-full object-cover shadow-sm ${props.className || ''}`}
        />
    );
}
