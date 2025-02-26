'use client'

import React, { useRef, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Balancer from 'react-wrap-balancer'
import AuthButton from '../buttons/authButton'
import { type Conversation, type ConversationParticipant } from '@prisma/client'

// Update interface to match Prisma schema exactly
interface ConversationWithParticipants extends Conversation {
  participants: ConversationParticipant[];
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const [conversations, setConversations] = useState<ConversationWithParticipants[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchConversations() {
      try {
        console.log('Making API request...')
        const response = await fetch('/api/conversations')
        console.log('API Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('First conversation:', data[0]) // Debug log to see the data structure
        setConversations(data)
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div
      ref={parentRef}
      className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center overflow-hidden bg-neutral-50 px-4 pt-32 dark:bg-neutral-900 md:justify-center md:px-8 md:py-20 lg:py-32"
    >
      <BackgroundGrids />
      <CollisionMechanism
        beamOptions={{
          initialX: -400,
          translateX: 600,
          duration: 7,
          repeatDelay: 3,
        }}
        containerRef={containerRef}
        parentRef={parentRef}
      />
      <CollisionMechanism
        beamOptions={{
          initialX: -200,
          translateX: 800,
          duration: 4,
          repeatDelay: 3,
        }}
        containerRef={containerRef}
        parentRef={parentRef}
      />
      <CollisionMechanism
        beamOptions={{
          initialX: 200,
          translateX: 1200,
          duration: 5,
          repeatDelay: 3,
        }}
        containerRef={containerRef}
        parentRef={parentRef}
      />
      <CollisionMechanism
        containerRef={containerRef}
        parentRef={parentRef}
        beamOptions={{
          initialX: 400,
          translateX: 1400,
          duration: 6,
          repeatDelay: 3,
        }}
      />

      <div className="relative z-20 mx-auto mb-4 mt-4 max-w-4xl text-balance text-center text-5xl font-semibold tracking-tight text-gray-700 dark:text-neutral-300 md:text-6xl lg:text-7xl">
        <Balancer>
          <motion.h2>
            {'Your home for all things AI x Onchain'
              .split(' ')
              .map((word, index) => (
                <motion.span
                  initial={{
                    filter: 'blur(10px)',
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    filter: 'blur(0px)',
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                  }}
                  className="inline-block"
                  key={index}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
          </motion.h2>
        </Balancer>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.5 }}
        className="relative z-20 mx-auto mt-4 max-w-lg px-4 text-center text-2xl/6 text-gray-600 dark:text-gray-200"
      >
        Welcome to the third space where your ideas transform into reality.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.7 }}
        className="z-20 mb-10 mt-8 flex w-full flex-col items-center justify-center gap-4 px-8 sm:flex-row md:mb-20"
      >
        <AuthButton
          buttonText="Join the Club"
          size="lg"
          className="text-lg font-semibold"
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl p-4"
      >
        <h2 className="text-2xl font-bold mb-6">OMI CONVERSATIONS:</h2>

        {loading ? (
          <div className="text-center py-10">Loading conversations...</div>
        ) : conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
              >
                <div className="cursor-pointer">
                  <div 
                    onClick={() => toggleExpand(conversation.id)}
                    className="flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold">
                      {conversation.title || `Conversation #${conversation.id}`}
                    </h3>
                    <span 
                      className={`text-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-transform duration-200 ${
                        expandedIds.has(conversation.id) ? 'rotate-180' : ''
                      }`}
                    >
                      ⌄
                    </span>
                  </div>

                  <AnimatePresence>
                    {expandedIds.has(conversation.id) ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-4">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Content:</h4>
                            <p className="text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                              {conversation.content}
                            </p>
                          </div>

                          {conversation.summary && (
                            <div>
                              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Summary:</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {conversation.summary}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {conversation.content}
                      </p>
                    )}
                  </AnimatePresence>

                  <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                    <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
                    <span>Participants: {conversation.participants.length}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">No conversations found.</div>
        )}
      </motion.div>

      {/* <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9, ease: 'easeOut' }}
        ref={containerRef}
        className="relative mx-auto max-w-7xl rounded-[32px] border border-neutral-200/50 bg-neutral-100 p-2 backdrop-blur-lg dark:border-neutral-700 dark:bg-neutral-800/50 md:p-4"
      >
        <div className="rounded-[24px] border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-black">
          <Image
            src="https://assets.aceternity.com/pro/dashboard-new.webp"
            alt="header"
            width={1920}
            height={1080}
            className="rounded-[20px]"
          />
        </div>
      </motion.div> */}
    </div>
  )
}

const BackgroundGrids = () => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 grid h-full w-full -rotate-45 transform select-none grid-cols-2 gap-10 md:grid-cols-4">
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full bg-gradient-to-b from-transparent via-neutral-100 to-transparent dark:via-neutral-800">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
    </div>
  )
}

const CollisionMechanism = React.forwardRef<
  HTMLDivElement,
  {
    containerRef: React.RefObject<HTMLDivElement>
    parentRef: React.RefObject<HTMLDivElement>
    beamOptions?: {
      initialX?: number
      translateX?: number
      initialY?: number
      translateY?: number
      rotate?: number
      className?: string
      duration?: number
      delay?: number
      repeatDelay?: number
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ parentRef, containerRef, beamOptions = {} }, _ref) => {
  const beamRef = useRef<HTMLDivElement>(null)
  const [collision, setCollision] = useState<{
    detected: boolean
    coordinates: { x: number; y: number } | null
  }>({
    detected: false,
    coordinates: null,
  })
  const [beamKey, setBeamKey] = useState(0)
  const [cycleCollisionDetected, setCycleCollisionDetected] = useState(false)

  useEffect(() => {
    const checkCollision = () => {
      if (
        beamRef.current &&
        containerRef.current &&
        parentRef.current &&
        !cycleCollisionDetected
      ) {
        const beamRect = beamRef.current.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        const parentRect = parentRef.current.getBoundingClientRect()

        if (beamRect.bottom >= containerRect.top) {
          const relativeX = beamRect.left - parentRect.left + beamRect.width / 2
          const relativeY = beamRect.bottom - parentRect.top

          setCollision({
            detected: true,
            coordinates: {
              x: relativeX,
              y: relativeY,
            },
          })
          setCycleCollisionDetected(true)
          if (beamRef.current) {
            beamRef.current.style.opacity = '0'
          }
        }
      }
    }

    const animationInterval = setInterval(checkCollision, 50)

    return () => clearInterval(animationInterval)
  }, [cycleCollisionDetected, containerRef, parentRef])

  useEffect(() => {
    if (collision.detected && collision.coordinates) {
      setTimeout(() => {
        setCollision({ detected: false, coordinates: null })
        setCycleCollisionDetected(false)
        // Set beam opacity to 0
        if (beamRef.current) {
          beamRef.current.style.opacity = '1'
        }
      }, 2000)

      // Reset the beam animation after a delay
      setTimeout(() => {
        setBeamKey((prevKey) => prevKey + 1)
      }, 2000)
    }
  }, [collision])

  return (
    <>
      <motion.div
        key={beamKey}
        ref={beamRef}
        animate="animate"
        initial={{
          translateY: beamOptions.initialY || '-200px',
          translateX: beamOptions.initialX || '0px',
          rotate: beamOptions.rotate || -45,
        }}
        variants={{
          animate: {
            translateY: beamOptions.translateY || '800px',
            translateX: beamOptions.translateX || '700px',
            rotate: beamOptions.rotate || -45,
          },
        }}
        transition={{
          duration: beamOptions.duration || 8,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear',
          delay: beamOptions.delay || 0,
          repeatDelay: beamOptions.repeatDelay || 0,
        }}
        className={cn(
          'absolute left-96 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-orange-500 via-yellow-500 to-transparent',
          beamOptions.className,
        )}
      />
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`${collision.coordinates.x}-${collision.coordinates.y}`}
            className=""
            style={{
              left: `${collision.coordinates.x + 20}px`,
              top: `${collision.coordinates.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
})

CollisionMechanism.displayName = 'CollisionMechanism'

const Explosion = ({ ...props }: React.HTMLProps<HTMLDivElement>) => {
  const spans = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
  }))

  return (
    <div {...props} className={cn('absolute z-10 h-2 w-2', props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute -inset-x-10 top-0 m-auto h-[4px] w-10 rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-sm"
      ></motion.div>
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: 'easeOut' }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-orange-500 to-yellow-500"
        />
      ))}
    </div>
  )
}

const GridLineVertical = ({
  className,
  offset,
}: {
  className?: string
  offset?: string
}) => {
  return (
    <div
      style={
        {
          '--background': '#ffffff',
          '--color': 'rgba(0, 0, 0, 0.2)',
          '--height': '5px',
          '--width': '1px',
          '--fade-stop': '90%',
          '--offset': offset || '150px', //-100px if you want to keep the line inside
          '--color-dark': 'rgba(255, 255, 255, 0.3)',
          maskComposite: 'exclude',
        } as React.CSSProperties
      }
      className={cn(
        'absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]',
        'bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]',
        '[background-size:var(--width)_var(--height)]',
        '[mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)]',
        '[mask-composite:exclude]',
        'z-30',
        'dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)]',
        className,
      )}
    ></div>
  )
}
