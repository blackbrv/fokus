import { useCallback } from "react";

export function useNotification() {
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    if (Notification.permission === "default") {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }, []);

  const notify = useCallback((title: string, body?: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.svg" });
    }
  }, []);

  return { requestPermission, notify };
}
