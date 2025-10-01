export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground">Bienvenue dans Invoice Manager !</p>
      <div className="mt-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Test du thème</h2>
        <p>Cette carte devrait changer d'apparence avec le dark/light mode !</p>
      </div>
    </div>
  )
}
