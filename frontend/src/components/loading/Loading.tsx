import styles from "./loading.module.css";

export const Loading = () => {
  return (
    <div className={styles["spinner-container"]}>
      <div className={styles.spinner} />
    </div>
  );
};

