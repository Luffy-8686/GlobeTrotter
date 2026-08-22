import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ItineraryBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // We merged the builder functionality directly into the ItineraryView for a smoother UX.
    navigate(`/trips/${id}`);
  }, [id, navigate]);

  return <div>Redirecting to Itinerary View...</div>;
}
