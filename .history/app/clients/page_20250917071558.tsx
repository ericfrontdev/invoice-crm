export default function ClientsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          + Nouveau client
        </button>
      </div>

      <div>
        {/* Ici on va mettre nos cartes flip */}
        <p>Cartes clients à venir...</p>
      </div>
    </div>
  )
}
