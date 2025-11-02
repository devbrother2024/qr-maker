export function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">QR Maker</h1>
        <p className="mb-8 text-muted-foreground">
          URL을 입력하여 빠르고 쉽게 QR 코드를 생성하세요.
        </p>
        <div className="rounded-lg border bg-card p-8">
          <p className="text-muted-foreground">QR 생성 기능은 곧 추가될 예정입니다.</p>
        </div>
      </div>
    </div>
  )
}

