import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import "./Layout.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <SearchBar />
        {children}
      </main>
    </div>
  );
}
