"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { BACK_END_URL } from "@/app/consts";

interface Snack {
  id: number;
  name: string;
  price: number;
  image_url: string;
}

type CartItem = Snack & {
  quantity: number;
};

interface Room {
  number_string: string;
  floor: number;
}

export function SnackShopComponent() {
  useEffect(() => {
    console.log("👇", process.env);
    fetch(`${BACK_END_URL}/snacks`)
      .then((res) => res.json())
      .then((data) => {
        setSnacks(data);
      });

    fetch(`${BACK_END_URL}/rooms`)
      .then((res) => res.json())
      .then((data) => {
        const groupedRooms = data.reduce(
          (acc: { [key: number]: string[] }, room: Room) => {
            const { floor, number_string } = room;
            if (!acc[floor]) {
              acc[floor] = [];
            }
            acc[floor].push(number_string);
            return acc;
          },
          {} as { [key: number]: string[] }
        );
        setGroupedRooms(groupedRooms);
      });
  }, []);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [groupedRooms, setGroupedRooms] = useState<{ [key: number]: string[] }>(
    {}
  );
  const [floor, setFloor] = useState<number | undefined>(undefined);
  const [roomNumber, setRoomNumber] = useState<string | undefined>(undefined);

  useEffect(() => {
    setRoomNumber(undefined);
  }, [floor]);

  const [snacks, setSnacks] = useState<Snack[]>([]);

  const addToCart = (snack: Snack) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === snack.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === snack.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...snack, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prevCart.filter((item) => item.id !== id);
      }
    });
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const response = fetch(`${BACK_END_URL}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart,
        room_number_string: roomNumber,
      }),
    });

    response
      .then((response) => response.json())
      .then((data) => {
        alert(`订单已提交！总价：${totalPrice}元，送货地址：${roomNumber}`);
        setCart([]);
      })
      .catch((error) => {
        alert(`订单提交失败，丸辣 ${error}`);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🐓刘鸡鸡的零食店</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {snacks.map((snack) => (
          <div key={snack.id} className="border p-4 rounded-lg shadow">
            <div className="aspect-square relative mb-2">
              <Image
                src={snack.image_url}
                alt={snack.name}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <h2 className="text-lg font-semibold">{snack.name}</h2>
            <p className="text-gray-600">￥{snack.price}</p>
            <Button onClick={() => addToCart(snack)} className="mt-2 w-full">
              添加到购物车
            </Button>
          </div>
        ))}
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed bottom-4 right-4 rounded-full w-16 h-16">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>购物车</SheetTitle>
          </SheetHeader>
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">购物车是空的</p>
          ) : (
            <div className="mt-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center mb-2">
                  <div className="w-16 h-16 relative mr-2">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <span>{item.name}</span>
                    <div className="text-sm text-gray-500">￥{item.price}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="mt-4 font-bold">总价: ￥{totalPrice}</div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="floor">楼层</Label>
                <Select
                  value={floor?.toString()}
                  onValueChange={(newFloor) => setFloor(Number(newFloor))}
                >
                  <SelectTrigger id="floor">
                    <SelectValue placeholder="选择楼层" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {Object.keys(groupedRooms).map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}楼
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="roomNumber">牌号</Label>
                <Select
                  value={roomNumber}
                  onValueChange={setRoomNumber}
                  disabled={typeof floor === "undefined"}
                >
                  <SelectTrigger id="roomNumber">
                    <SelectValue placeholder="选择牌号" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {floor
                      ? groupedRooms[floor].map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))
                      : null}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={cart.length === 0 || typeof roomNumber === "undefined"}
            >
              提交订单
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
