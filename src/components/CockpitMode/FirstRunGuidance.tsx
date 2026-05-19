import { useEffect, useState } from 'react';

const STORAGE_KEY = 'virtualcdu.cockpitGuidanceDismissed';

export function FirstRunGuidance() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== 'true');
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  return (
    <section className="cockpit-first-run" aria-label="Cockpit workspace tips">
      <div>
        <strong>Task modes keep instruments readable.</strong>
        <span>
          Use Focus for detailed input, Pin to keep a panel visible, and the tray to bring hidden panels back.
        </span>
      </div>
      <button type="button" onClick={dismiss}>
        Got it
      </button>
    </section>
  );
}
