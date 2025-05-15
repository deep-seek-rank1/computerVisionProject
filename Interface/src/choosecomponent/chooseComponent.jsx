import './chooseComponent.css';
import { Link } from 'react-router-dom';

export default function ChooseComponent(props){
  return(
    <article className="component-card">
            <img
                src={props.img}
                alt="Photo "
            />
            <h3>{props.name}</h3>
            <div className="link-contain">
            <Link to={props.link} className='choose-a'>Start</Link>
            </div>
        </article>
  )

}
