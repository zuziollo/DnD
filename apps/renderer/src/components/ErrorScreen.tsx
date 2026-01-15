type ErrorScreenProps = {
  error: string;
  detail?: string;
  onRetry?: () => void;
};

export function ErrorScreen({ error, detail, onRetry }: ErrorScreenProps) {
  return (
    <div className="error-screen">
      <h2>Wystąpił błąd</h2>
      <pre className="error-screen__msg">{error}</pre>
      {detail ? <pre className="error-screen__detail">{detail}</pre> : null}
      {onRetry ? (
        <button className="btn btn--primary" onClick={onRetry}>
          Spróbuj ponownie
        </button>
      ) : null}
    </div>
  );
}