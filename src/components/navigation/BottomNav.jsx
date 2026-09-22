import { NavLink } from "react-router-dom";

import { HomeIcon, TrainIcon, UserIcon, PlusIcon, SavedIcon } from "../icons";

import styles from "./BottomNav.module.css";

function BottomNav({ onReport }) {
    return (
        <nav className={styles.bottomNav}>
            
            <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    `${styles.navItem} ${
                        isActive ? styles.active : ""
                    }`
                }
            >
                <HomeIcon size={21} />
                <span>Home</span>
            </NavLink>

            <NavLink
                to="/trains"
                className={({ isActive }) =>
                    `${styles.navItem} ${
                        isActive ? styles.active : ""
                    }`
                }
            >
                <TrainIcon size={21} />
                <span>Trains</span>
            </NavLink>

            <button
                type="button"
                className={styles.navFab}
                onClick={onReport}
                aria-label="Report train update"
            >
                <PlusIcon
                    size={22}
                    strokeWidth={2.4}
                />
            </button>

            <NavLink
                to="/saved"
                className={({ isActive }) =>
                    `${styles.navItem} ${
                        isActive ? styles.active : ""
                    }`
                }
            >
                <SavedIcon size={21} />
                <span>Saved</span>
            </NavLink>

            <NavLink
                to="/profile"
                className={({ isActive }) =>
                    `${styles.navItem} ${
                        isActive ? styles.active : ""
                    }`
                }
            >
                <UserIcon size={21} />
                <span>Profile</span>
            </NavLink>
        </nav>
    );
}

export default BottomNav;