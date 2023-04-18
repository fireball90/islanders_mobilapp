import Alert from 'react-bootstrap/Alert';

import style from "./FloatAlert.module.css"

export default function FloatAlert({
    message, 
    variant,
    closeCallback,
}) {
    if (!!message) {
        setTimeout(() => {
            closeCallback()
        }, 2000)
    }

    return (
        !!message ? (
            <div className={style.container}>
                <Alert 
                    variant={variant ? variant : 'primary'}
                    className="border-0, rounded-0"
                >
                    { message }
                </Alert>
            </div>
        ) : null
    )
}