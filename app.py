import asyncio
import aioredis


async def main():
    redis = await aioredis.create_redis('redis://localhost/0')

    ch1 = (await redis.subscribe('chan:1'))[0]
    print(ch1)



asyncio.get_event_loop().run_until_complete(main())
