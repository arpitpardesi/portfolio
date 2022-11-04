import React from "react";
import "../css/footer.css"

const Footer = () => {
    let year = new Date().getFullYear()
    return (
        <div className="footer">
            <div>
                <p>Copyright &copy; {`${year}`} | Arpit Pardesi,  All rights reserved</p>
            </div>
        </div>
    )
}
export default Footer;