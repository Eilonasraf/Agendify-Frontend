// src/pages/PromotePage.tsx
import React, { useState } from "react";
import PromoteForm from "../components/PromoteForm";

export default function PromotePage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Promote Your Agenda</h1>
      <PromoteForm />
    </div>
  );
}
