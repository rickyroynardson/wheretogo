import { notFound } from "next/navigation";

// Always a 404, so there's no instant UI to validate
export const instant = false;

// Any unknown path under a language shows that language's not-found page
export default function CatchAll() {
  notFound();
}
