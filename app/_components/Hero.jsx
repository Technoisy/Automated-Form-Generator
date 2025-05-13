import React from 'react';

function Hero({ onLearnMore }) {
  return (
    <section className="bg-white lg:grid lg:h-screen lg:place-content-center dark:bg-gray-900">
      <div className="mx-auto w-screen max-w-screen-xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-prose text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl dark:text-white">
            Build Beautiful Forms Instantly
            <span className="text-indigo-600"> using AI</span>
          </h1>

          <p className="mt-6 text-lg text-gray-700 dark:text-gray-200">
            Save hours of manual form building. Just describe your form,
            and let our AI Form Generator do the work for you.
            Customize, submit, and save—all in seconds.
          </p>

          <div className="mt-4 flex justify-center gap-4 sm:mt-6">
            <button
              onClick={onLearnMore}
              className="inline-block rounded border border-gray-200 px-5 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
